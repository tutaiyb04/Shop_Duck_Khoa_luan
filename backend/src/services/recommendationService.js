const mongoose = require("mongoose");
const Product = require("../model/Product");
const Order = require("../model/Order");
const Review = require("../model/Review");
const User = require("../model/User");
const Category = require("../model/Category");
const UserRecommendation = require("../model/UserRecommendation");
const redisCache = require("../config/redis");
const {
  POSITIVE_ORDER_STATUSES,
  POSITIVE_RATING_MIN,
  VIP_BOOST,
  MAX_LIMIT,
  DEFAULT_LIMIT,
  MAX_SIMILAR_USERS,
  MAX_INTERACTED_IDS,
  AGG_MAX_TIME_MS,
  MONGO_CACHE_TTL_SEC,
  MONGO_CACHE_STALE_AFTER_SEC,
  toObjectId,
  dedupeObjectIds,
  tokenizeProductText,
  diceCoefficient,
  loadWishlistProductIds,
  hydrateRecommendationProducts
} = require("../helper/recommendationHelper");

// Bước thu nhập dấu vết: thu nhập các sản phẩm mà user đã tương tác (đánh giá hoặc mua thành công)
const collectUserSeeds = async (userId) => {
  const [orders, reviews] = await Promise.all([
    Order.find({ buyerId: userId })
      .select("productId status createdAt")
      .sort({ createdAt: -1 })
      .lean()
      .maxTimeMS(AGG_MAX_TIME_MS),
    Review.find({ buyerId: userId })
      .select("productId rating createdAt")
      .sort({ createdAt: -1 })
      .lean()
      .maxTimeMS(AGG_MAX_TIME_MS),
  ]);

  const positiveProductIds = [
    ...orders
      .filter((o) => POSITIVE_ORDER_STATUSES.includes(o.status))
      .map((o) => o.productId),
    ...reviews
      .filter((r) => r.rating >= POSITIVE_RATING_MIN)
      .map((r) => r.productId),
  ];

  const allInteractedIdsSorted = [
    ...orders.map((o) => o.productId),
    ...reviews.map((r) => r.productId),
  ];

  const seedIds = dedupeObjectIds(positiveProductIds);

  // Giữ tối đa MAX_INTERACTED_IDS sản phẩm gần nhất để $nin nhẹ.
  const interactedIds = dedupeObjectIds(allInteractedIdsSorted).slice(
    0,
    MAX_INTERACTED_IDS,
  );

  return { seedIds, interactedIds };
};

// Tìm các user đã mua giống sản phẩm của nhau
const findTopSimilarUsers = async (userId, seedIds) => {
  if (seedIds.length === 0) return [];

  const pipeline = [
    {
      $match: {
        productId: { $in: seedIds },
        buyerId: { $ne: userId },
        status: { $in: POSITIVE_ORDER_STATUSES },
      },
    },
    { $project: { _id: 0, userId: "$buyerId", weight: { $literal: 1.0 } } },
    {
      $unionWith: {
        coll: Review.collection.name,
        pipeline: [
          {
            $match: {
              productId: { $in: seedIds },
              buyerId: { $ne: userId },
              rating: { $gte: POSITIVE_RATING_MIN },
            },
          },
          {
            $project: {
              _id: 0,
              userId: "$buyerId",
              // rating 3->1, 4->2, 5->3 (review tích cực hơn order)
              weight: { $subtract: ["$rating", 2] },
            },
          },
        ],
      },
    },
    { $group: { _id: "$userId", similarityScore: { $sum: "$weight" } } },
    { $match: { similarityScore: { $gte: 1 } } },
    { $sort: { similarityScore: -1 } },
    { $limit: MAX_SIMILAR_USERS },
  ];

  return Order.aggregate(pipeline)
    .option({ maxTimeMS: AGG_MAX_TIME_MS })
    .allowDiskUse(true);
};

// Tạo sản phẩm gợi ý từ các user đã mua giống sản phẩm của nhau
const buildRecommendationsFromSimilarUsers = async ({
  userId,
  similarUsers,
  interactedIds,
  limitN,
}) => {
  if (similarUsers.length === 0) return [];

  // 2 mảng song song (cùng index) -> dùng cho lookup score O(1) trong pipeline.
  const similarUserIds = similarUsers.map((u) => u._id);
  const similarUserScores = similarUsers.map((u) => u.similarityScore);

  const lookupSimScoreExpr = {
    $arrayElemAt: [
      similarUserScores,
      { $indexOfArray: [similarUserIds, "$buyerId"] },
    ],
  };

  const pipeline = [
    // STAGE A: Tập ứng viên từ Order
    {
      $match: {
        buyerId: { $in: similarUserIds },
        status: { $in: POSITIVE_ORDER_STATUSES },
        productId: { $nin: interactedIds },
      },
    },
    {
      $project: {
        _id: 0,
        productId: 1,
        buyerId: 1,
        contribution: lookupSimScoreExpr,
        ratingValue: { $literal: null },
      },
    },
    // STAGE B: Cộng thêm tập ứng viên từ Review
    {
      $unionWith: {
        coll: Review.collection.name,
        pipeline: [
          {
            $match: {
              buyerId: { $in: similarUserIds },
              rating: { $gte: POSITIVE_RATING_MIN },
              productId: { $nin: interactedIds },
            },
          },
          {
            $project: {
              _id: 0,
              productId: 1,
              buyerId: 1,
              contribution: {
                $multiply: [
                  lookupSimScoreExpr,
                  { $subtract: ["$rating", 2] },
                ],
              },
              ratingValue: "$rating",
            },
          },
        ],
      },
    },

    // STAGE C: Tính điểm theo product
    {
      $group: {
        _id: "$productId",
        score: { $sum: "$contribution" },
        similarBuyers: { $addToSet: "$buyerId" },
        avgRating: { $avg: "$ratingValue" }, // null tự bị $avg bỏ qua
      },
    },
    { $addFields: { similarBuyers: { $size: "$similarBuyers" } } },

    // STAGE D: Join Product + lọc hợp lệ
    {
      $lookup: {
        from: Product.collection.name,
        let: { pid: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id", "$$pid"] },
                  { $eq: ["$status", "AVAILABLE"] },
                  { $ne: ["$sellerId", userId] },
                ],
              },
            },
          },
        ],
        as: "product",
      },
    },
    { $unwind: "$product" },

    // STAGE E: Boost VIP + sort + limit (sớm để các stage sau nhẹ)
    {
      $addFields: {
        finalScore: {
          $add: [
            "$score",
            { $cond: [{ $eq: ["$product.isVIP", true] }, VIP_BOOST, 0] },
          ],
        },
      },
    },
    { $sort: { finalScore: -1, similarBuyers: -1, "product.updatedAt": -1 } },
    { $limit: limitN },

    // STAGE F: Hydrate seller + category
    {
      $lookup: {
        from: User.collection.name,
        let: { sid: "$product.sellerId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$sid"] } } },
          { $project: { username: 1, avatar: 1 } },
        ],
        as: "sellerArr",
      },
    },
    {
      $lookup: {
        from: Category.collection.name,
        let: { cid: "$product.category" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$cid"] } } },
          { $project: { name: 1 } },
        ],
        as: "categoryArr",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            "$product",
            {
              sellerId: { $arrayElemAt: ["$sellerArr", 0] },
              category: { $arrayElemAt: ["$categoryArr", 0] },
              recommendation: {
                score: "$finalScore",
                similarBuyers: "$similarBuyers",
                avgRating: "$avgRating",
              },
            },
          ],
        },
      },
    },
  ];

  return Order.aggregate(pipeline)
    .option({ maxTimeMS: AGG_MAX_TIME_MS })
    .allowDiskUse(true);
};

// hàm tính toán gợi ý content-based
exports.getContentBasedRecommendationsService = async (
  userIdRaw,
  options = {},
) => {
  const userIdStr = String(userIdRaw || "").trim();

  if (!mongoose.isValidObjectId(userIdStr)) {
    throw new Error("Mã người dùng không hợp lệ.");
  }

  const userId = toObjectId(userIdStr);
  const limitN = Math.min(
    Math.max(parseInt(options.limit, 10) || DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  );

  // lấy danh sách sản phẩm đã tương tác và sản phẩm yêu thích của user
  const [{ seedIds, interactedIds }, wishlistIds] = await Promise.all([
    collectUserSeeds(userId),
    loadWishlistProductIds(userId),
  ]);

  const profileProductIds = dedupeObjectIds([
    ...seedIds.map((id) => String(id)),
    ...wishlistIds.map((id) => String(id)),
  ]);

  if (profileProductIds.length === 0) {
    return {
      products: [],
      usedFallback: true,
      debug: {
        profileCount: 0,
        interactedCount: interactedIds.length,
      },
    };
  }

  const profileProducts = await Product.find({
    _id: { $in: profileProductIds.slice(0, 80) },
  })
    .select("name description category condition price attributes isVIP")
    .lean()
    .maxTimeMS(AGG_MAX_TIME_MS);

  if (!profileProducts.length) {
    return {
      products: [],
      usedFallback: true,
      debug: {
        profileCount: 0,
        interactedCount: interactedIds.length,
      },
    };
  }

  const categoryWeights = new Map();
  let priceSum = 0;
  let priceN = 0;
  const conditionCounts = new Map();
  const profileTokenSet = new Set();

  for (const p of profileProducts) {
    const ckey = String(p.category);
    categoryWeights.set(ckey, (categoryWeights.get(ckey) || 0) + 1);
    priceSum += Number(p.price) || 0;
    priceN += 1;
    conditionCounts.set(
      p.condition,
      (conditionCounts.get(p.condition) || 0) + 1,
    );
    for (const t of tokenizeProductText(p)) {
      profileTokenSet.add(t);
    }
  }

  const avgPrice = priceN ? priceSum / priceN : 0;
  let topCondition = null;
  let topCondN = 0;
  for (const [cond, n] of conditionCounts) {
    if (n > topCondN) {
      topCondN = n;
      topCondition = cond;
    }
  }

  const preferredCategories = [...categoryWeights.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([id]) => toObjectId(id));

  const baseMatch = {
    status: "AVAILABLE",
    sellerId: { $ne: userId },
    _id: { $nin: interactedIds },
  };

  const selectFields =
    "name description category condition price isVIP sellerId images address location attributes createdAt updatedAt";

  // tìm ứng viên để lọc
  let candidates = await Product.find({
    ...baseMatch,
    category: { $in: preferredCategories },
  })
    .select(selectFields)
    .limit(280)
    .lean()
    .maxTimeMS(AGG_MAX_TIME_MS);

  if (candidates.length < Math.max(limitN * 6, 36)) {
    const more = await Product.find(baseMatch)
      .select(selectFields)
      .sort({ updatedAt: -1 })
      .limit(220)
      .lean()
      .maxTimeMS(AGG_MAX_TIME_MS);
    const seen = new Set(candidates.map((c) => String(c._id)));
    for (const m of more) {
      const id = String(m._id);
      if (!seen.has(id)) {
        seen.add(id);
        candidates.push(m);
      }
    }
  }

  // chấm điểm các sản phẩm còn lại
  const scored = [];
  for (const c of candidates) {
    const catW = categoryWeights.get(String(c.category)) || 0;
    const candTokens = tokenizeProductText(c);
    const dice = diceCoefficient(profileTokenSet, candTokens);
    let score = catW * 4 + dice * 14;

    if (topCondition && c.condition === topCondition) score += 1.6;

    if (avgPrice > 0) {
      const pr = Number(c.price) || 0;
      if (pr >= avgPrice * 0.3 && pr <= avgPrice * 3.2) score += 1.1;
    }

    if (c.isVIP) score += VIP_BOOST;

    if (score < 0.01) continue;

    scored.push({ doc: c, score, dice, catW });
  }

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, limitN);

  const raw = top.map((t) => ({
    ...t.doc,
    recommendation: {
      score: t.score,
      method: "content",
      textSimilarity: Math.round(t.dice * 1000) / 1000,
      categoryAffinity: t.catW,
    },
  }));

  const products = await hydrateRecommendationProducts(raw);

  return {
    products,
    usedFallback: false,
    debug: {
      profileCount: profileProducts.length,
      interactedCount: interactedIds.length,
      preferredCategories: preferredCategories.length,
    },
  };
};

// hàm tính toán gợi ý hybrid (CF + CBF)
exports.getHybridRecommendationsService = async (userIdRaw, options = {}) => {
  const userIdStr = String(userIdRaw || "").trim();
  if (!mongoose.isValidObjectId(userIdStr)) {
    throw new Error("Mã người dùng không hợp lệ.");
  }

  const limitN = Math.min(
    Math.max(parseInt(options.limit, 10) || DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  );

  // khởi động kép cả 2 cách gợi ý tìm kiếm
  const pool = Math.min(limitN * 2, MAX_LIMIT);

  const [cfResult, cbfResult] = await Promise.all([
    exports.getCollaborativeRecommendationsService(userIdRaw, {
      ...options,
      limit: pool,
    }),
    exports.getContentBasedRecommendationsService(userIdRaw, {
      ...options,
      limit: pool,
    }),
  ]);

  // gọi hàm trộn gợi ý collaborative và content-based
  const merged = mergeCfAndCbf(cfResult.products, cbfResult.products, limitN);

  return {
    products: merged,
    usedFallback: merged.length === 0,
    debug: {
      cf: cfResult.debug,
      cbf: cbfResult.debug,
      mergedCount: merged.length,
    },
  };
};

// hàm thực hiện tính toán gợi ý collaborative filtering - 3 hàm ở trên ghép lại
exports.getCollaborativeRecommendationsService = async (
  userIdRaw,
  options = {},
) => {
  const userIdStr = String(userIdRaw || "").trim();
  if (!mongoose.isValidObjectId(userIdStr)) {
    throw new Error("Mã người dùng không hợp lệ.");
  }

  const userId = toObjectId(userIdStr);
  const limitN = Math.min(
    Math.max(parseInt(options.limit, 10) || DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  );

  // bước thu nhập dấu vết: thu nhập các sản phẩm mà user đã tương tác (đánh giá hoặc mua thành công)
  const { seedIds, interactedIds } = await collectUserSeeds(userId);

  if (seedIds.length === 0) {
    return {
      products: [],
      usedFallback: true,
      debug: {
        seedCount: 0,
        interactedCount: interactedIds.length,
        similarUsersCount: 0,
      },
    };
  }

  // tìm các user đã mua giống sản phẩm của nhau
  const similarUsers = await findTopSimilarUsers(userId, seedIds);

  if (similarUsers.length === 0) {
    return {
      products: [],
      usedFallback: true,
      debug: {
        seedCount: seedIds.length,
        interactedCount: interactedIds.length,
        similarUsersCount: 0,
      },
    };
  }

  // tạo sản phẩm gợi ý từ các user đã mua giống sản phẩm của nhau
  const products = await buildRecommendationsFromSimilarUsers({
    userId,
    similarUsers,
    interactedIds,
    limitN,
  });

  return {
    products,
    usedFallback: false,
    debug: {
      seedCount: seedIds.length,
      interactedCount: interactedIds.length,
      similarUsersCount: similarUsers.length,
    },
  };
};

// Export hằng số để cron job và service khác tái sử dụng
exports.RECOMMENDATION_CONSTANTS = {
  POSITIVE_ORDER_STATUSES,
  POSITIVE_RATING_MIN,
  MAX_SIMILAR_USERS,
  MAX_INTERACTED_IDS,
  AGG_MAX_TIME_MS,
  DEFAULT_LIMIT,
  MAX_LIMIT,
};

// gọi hybrid (CF + Content-Based) -> cache Redis + Mongo
exports.computeAndCacheRecommendations = async (userIdRaw, options = {}) => {
  const result = await exports.getHybridRecommendationsService(
    userIdRaw,
    options,
  );

  let source = "empty";
  if (result.products.length > 0) {
    const methods = new Set(
      result.products.map((p) => p.recommendation?.method).filter(Boolean),
    );
    if (methods.has("hybrid")) {
      source = "hybrid";
    } else if (methods.has("collaborative") && methods.has("content")) {
      source = "hybrid";
    } else if (methods.has("collaborative")) {
      source = "cf";
    } else {
      source = "cbf";
    }
  }

  const computedAt = new Date();
  const expiresAt = new Date(computedAt.getTime() + MONGO_CACHE_TTL_SEC * 1000);

  const payload = {
    userId: String(userIdRaw),
    products: result.products,
    source,
    seedCount: result.debug?.cf?.seedCount ?? 0,
    similarUsersCount: result.debug?.cf?.similarUsersCount ?? 0,
    computedAt,
    expiresAt,
  };

  // Ghi song song 2 tầng (best-effort, không throw nếu lỗi)
  await Promise.allSettled([
    UserRecommendation.findOneAndUpdate(
      { userId: payload.userId },
      payload,
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).maxTimeMS(AGG_MAX_TIME_MS),
    redisCache.setCache(payload.userId, {
      products: payload.products,
      source: payload.source,
      computedAt: computedAt.toISOString(),
    }),
  ]);

  return payload;
};

// hàm lấy gợi ý cho user - 2 tầng cache (Redis L1 + Mongo L2) - hàm chính API gọi
exports.getRecommendationsForUser = async (userIdRaw, options = {}) => {
  const { forceRefresh = false, limit } = options;
  const userIdStr = String(userIdRaw || "").trim();

  if (!mongoose.isValidObjectId(userIdStr)) {
    throw new Error("Mã người dùng không hợp lệ.");
  }

  // Redis L1
  if (!forceRefresh) {
    const cached = await redisCache.getCache(userIdStr);
    if (cached && Array.isArray(cached.products)) {
      return {
        products: limit
          ? cached.products.slice(0, parseInt(limit, 10) || cached.products.length)
          : cached.products,
        source: cached.source || "cf",
        cacheHit: "redis",
        computedAt: cached.computedAt,
      };
    }
  }

  // Mongo L2 - UserRecommendation
  if (!forceRefresh) {
    const doc = await UserRecommendation.findOne({ userId: userIdStr })
      .lean()
      .maxTimeMS(AGG_MAX_TIME_MS);

    if (doc) {
      const ageMs = Date.now() - new Date(doc.computedAt).getTime();
      const isFresh = ageMs < MONGO_CACHE_STALE_AFTER_SEC * 1000;

      if (isFresh) {
        // làm nóng cache Redis (best-effort)
        redisCache
          .setCache(userIdStr, {
            products: doc.products,
            source: doc.source,
            computedAt: new Date(doc.computedAt).toISOString(),
          })
          .catch(() => {});

        return {
          products: limit
            ? doc.products.slice(0, parseInt(limit, 10) || doc.products.length)
            : doc.products,
          source: doc.source || "cf",
          cacheHit: "mongo",
          computedAt: new Date(doc.computedAt).toISOString(),
        };
      }
    }
  }

  // nếu redis và mongo đều miss -> tính toán và ghi vào cache
  const fresh = await exports.computeAndCacheRecommendations(userIdStr, {
    limit,
  });

  return {
    products: fresh.products,
    source: fresh.source,
    cacheHit: "miss",
    computedAt: fresh.computedAt.toISOString(),
  };
};

// xoá cache (cả 2 tầng) khi user có order/review mới
exports.invalidateUserRecommendation = async (userIdRaw) => {
  const userIdStr = String(userIdRaw || "").trim();
  if (!mongoose.isValidObjectId(userIdStr)) return;

  await Promise.allSettled([
    redisCache.delCache(userIdStr),
    UserRecommendation.deleteOne({ userId: userIdStr }).maxTimeMS(
      AGG_MAX_TIME_MS,
    ),
  ]);
};
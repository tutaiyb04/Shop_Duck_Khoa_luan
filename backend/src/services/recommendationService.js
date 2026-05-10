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
  hydrateRecommendationProducts,
  mergeCfAndCbf,
} = require("../helper/recommendationHelper");

// đọc song song 2 bảng Order và Review để lấy danh sách sản phẩm mà user đã tương tác (đánh giá và mua thành công)
const collectUserSeeds = async (userId) => {
  const [orders, reviews] = await Promise.all([
    Order.find({ buyerId: userId })
      .select("productId status createdAt")
      .sort({ createdAt: -1 })
      .lean() // chỉ đọc dữ liệu, ko tải toàn bộ document vào RAM
      .maxTimeMS(AGG_MAX_TIME_MS),
    Review.find({ buyerId: userId })
      .select("productId rating createdAt")
      .sort({ createdAt: -1 })
      .lean()
      .maxTimeMS(AGG_MAX_TIME_MS),
  ]);

  // lấy danh sách sản phẩm - lọc theo trạng thái đơn hàng đã thành công và đánh giá tích cực
  const positiveProductIds = [
    ...orders
      .filter((o) => POSITIVE_ORDER_STATUSES.includes(o.status))
      .map((o) => o.productId),
    ...reviews
      .filter((r) => r.rating >= POSITIVE_RATING_MIN)
      .map((r) => r.productId),
  ];

  // lọc theo tất cả các đơn hàng đã mua và đã đánh giá
  const allInteractedIdsSorted = [
    ...orders.map((o) => o.productId),
    ...reviews.map((r) => r.productId),
  ];

  // lọc bỏ các ID trùng lặp
  const seedIds = dedupeObjectIds(positiveProductIds);

  // chỉ giữ tối đa các phẩn tử đầu mảng - tối đa 500 sản phẩm gần nhất
  const interactedIds = dedupeObjectIds(allInteractedIdsSorted).slice(
    0,
    MAX_INTERACTED_IDS,
  );

  return { seedIds, interactedIds };
};

// lấy các sản phẩm mà các user có sở thích / mua - đánh giá giống nhau với user hiện tại
const findTopSimilarUsers = async (userId, seedIds) => {
  if (seedIds.length === 0) return []; // nếu không có sản phẩm đã tương tác -> ko có user để so sánh

  const pipeline = [
    {
      $match: {
        productId: { $in: seedIds }, // lọc theo sản phẩm đã tương tác
        buyerId: { $ne: userId }, // lọc theo user khác user hiện tại
        status: { $in: POSITIVE_ORDER_STATUSES },
      },
    },
    { $project: { _id: 0, userId: "$buyerId", weight: { $literal: 1.0 } } }, // mỗi dòng có userId của user đã mua và đạt điểm = 1.0
    {
      // gộp thêm các đánh giá tích cực của user từ bảng Review đã mua với sản phẩm đã tương tác
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
    // nhóm theo userId và tính điểm tương tác tổng cộng
    { $group: { _id: "$userId", similarityScore: { $sum: "$weight" } } },
    { $match: { similarityScore: { $gte: 1 } } }, // lọc theo điểm tương tác tổng cộng >= 1
    { $sort: { similarityScore: -1 } },
    { $limit: MAX_SIMILAR_USERS }, // giới hạn tối đa 100 user
  ];

  return Order.aggregate(pipeline)
    .option({ maxTimeMS: AGG_MAX_TIME_MS })
    .allowDiskUse(true);
};

// xây dựng danh sách sản phẩm gợi ý từ các user đã mua giống sản phẩm của nhau
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

  //  tạo biểu thức để lấy điểm tương tác của user từ mảng similarUserScores dựa trên index của user trong mảng similarUserIds
  const lookupSimScoreExpr = {
    // lấy điểm tương tác của user từ mảng similarUserScores dựa trên index của user trong mảng similarUserIds
    $arrayElemAt: [
      similarUserScores,
      { $indexOfArray: [similarUserIds, "$buyerId"] }, // tìm index của user trong mảng similarUserIds
    ],
  };

  const pipeline = [
    // STAGE A: Tập ứng viên từ Order
    {
      $match: {
        buyerId: { $in: similarUserIds }, // lọc theo user đã mua sản phẩm đã tương tác
        status: { $in: POSITIVE_ORDER_STATUSES }, // lọc theo trạng thái đơn hàng đã thành công
        productId: { $nin: interactedIds }, // lọc theo sản phẩm không đã tương tác - không gợi ý sản phẩm đã tương tác
      },
    },
    {
      $project: {
        _id: 0, // ko trả về _id
        productId: 1,
        buyerId: 1, 
        contribution: lookupSimScoreExpr, // trả về điểm tương tác của user từ mảng similarUserScores dựa trên index của user trong mảng similarUserIds
        ratingValue: { $literal: null }, // trả về null
      },
    },

    // STAGE B: Cộng thêm tập ứng viên từ Review
    {
      // gộp thêm các đánh giá tích cực của user từ bảng Review đã mua với sản phẩm đã tương tác
      $unionWith: {
        coll: Review.collection.name, // gộp với bảng Review
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
              // tính điểm tương tác của user từ mảng similarUserScores dựa trên index của user trong mảng similarUserIds * điểm đánh giá tích cực
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
      // nhóm theo 1 sản phẩm ứng viên -> tính điểm tương tác tổng cộng
      $group: {
        _id: "$productId", // mỗi nhóm = một sản phẩm ứng viên
        score: { $sum: "$contribution" }, // tính điểm tương tác tổng cộng
        similarBuyers: { $addToSet: "$buyerId" },
        avgRating: { $avg: "$ratingValue" }, // null tự bị $avg bỏ qua
      },
    },
    { $addFields: { similarBuyers: { $size: "$similarBuyers" } } }, // đổi từ mảng thành số lượng user đã mua

    // STAGE D: Join Product + lọc hợp lệ
    {
      $lookup: {
        from: Product.collection.name,
        let: { pid: "$_id" },
        pipeline: [
          {
            // lọc theo sản phẩm thỏa mãn các điều kiện
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id", "$$pid"] },   // khớp với sản phẩm ứng viên
                  { $eq: ["$status", "AVAILABLE"] }, // trạng thái sản phẩm đang có sẵn
                  { $ne: ["$sellerId", userId] }, // không phải là user hiện tại
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
      // tạo thêm field finalScore = score + boost cho sản phẩm VIP
      $addFields: {
        finalScore: {
          $add: [
            "$score", // điểm tương tác tổng cộng của sản phẩm ứng viên đã tính ở STAGE C
            { $cond: [{ $eq: ["$product.isVIP", true] }, VIP_BOOST, 0] }, // boost cho sản phẩm VIP
          ],
        },
      },
    },
    { $sort: { finalScore: -1, similarBuyers: -1, "product.updatedAt": -1 } },
    { $limit: limitN }, // giới hạn tối đa số sản phẩm gợi ý

    // STAGE F: Lấy thông tin seller và category của sản phẩm
    {
      $lookup: {
        from: User.collection.name, // lấy thông tin seller từ bảng User
        let: { sid: "$product.sellerId" }, // lấy sellerId từ sản phẩm ứng viên
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$sid"] } } }, // khớp với sellerId
          { $project: { username: 1, avatar: 1 } },
        ],
        as: "sellerArr", // lưu vào mảng sellerArr - mảng 0 hoặc 1 phần tử
      },
    },
    {
      $lookup: {
        from: Category.collection.name, // lấy thông tin category từ bảng Category
        let: { cid: "$product.category" }, // lấy categoryId từ sản phẩm ứng viên
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$cid"] } } }, // khớp với categoryId
          { $project: { name: 1 } },
        ],
        as: "categoryArr", 
      },
    },
    {
      // thay thế root của document với kết quả từ các stage trước
      $replaceRoot: {
        newRoot: {
          // gộp thông tin sản phẩm ứng viên với thông tin seller và category
          $mergeObjects: [
            "$product",
            {
              sellerId: { $arrayElemAt: ["$sellerArr", 0] }, // lấy sellerId từ mảng sellerArr
              category: { $arrayElemAt: ["$categoryArr", 0] }, // lấy categoryId từ mảng categoryArr
              recommendation: {
                score: "$finalScore", // điểm tương tác tổng cộng của sản phẩm ứng viên đã tính ở STAGE E
                similarBuyers: "$similarBuyers", // số lượng user đã mua
                avgRating: "$avgRating", // đánh giá trung bình của sản phẩm ứng viên
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
  // số sản phẩm tối đa trả về
  const limitN = Math.min(
    Math.max(parseInt(options.limit, 10) || DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  );

  // lấy danh sách sản phẩm đã tương tác và sản phẩm yêu thích của user
  const [{ seedIds, interactedIds }, wishlistIds] = await Promise.all([
    collectUserSeeds(userId),
    loadWishlistProductIds(userId),
  ]);

  // các sản phẩm đã tương tác và sản phẩm yêu thích của user
  const profileProductIds = dedupeObjectIds([
    ...seedIds.map((id) => String(id)),
    ...wishlistIds.map((id) => String(id)),
  ]);

  // nếu ko có mẫu sản phẩm nào -> trả về mảng rỗng
  if (profileProductIds.length === 0) {
    return {
      products: [],
      usedFallback: true, // báo đã vào nhánh không đủ dữ liệu -> merge hybrid có thể hiểu là đã vào nhánh không đủ dữ liệu
      debug: {
        profileCount: 0, // ko có sản phẩm trong profile
        interactedCount: interactedIds.length, 
      },
    };
  }

  // lấy các sản phẩm từ bảng Product
  const profileProducts = await Product.find({
    _id: { $in: profileProductIds.slice(0, 80) }, // lấy tối đa 80 sản phẩm
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

  let priceSum = 0;
  let priceN = 0;
  const categoryWeights = new Map(); // user hay xem / quan tâm loại danh mục nào 
  const conditionCounts = new Map(); // tình trạng xuất hiện nhiều nhất để tính toán điểm
  const profileTokenSet = new Set();

  // tổng hợp tối đa 80 tin mẫu
  for (const p of profileProducts) {
    const ckey = String(p.category); // đưa danh mục về string để dùng làm key Map
    categoryWeights.set(ckey, (categoryWeights.get(ckey) || 0) + 1); // mỗi món trong profile tăng 1 điểm cho danh mục đó -> bt danh mục nào xhien nhiều
    
    // cộng tổng giá và đếm món để tính giá trung bình
    priceSum += Number(p.price) || 0; 
    priceN += 1;

    // đếm tình trạng xuất hiện nhiều nhất để tính toán điểm
    conditionCounts.set(
      p.condition,
      (conditionCounts.get(p.condition) || 0) + 1,
    );

    // tổng hợp từ khóa từ mô tả sản phẩm để tính toán điểm
    for (const t of tokenizeProductText(p)) {
      profileTokenSet.add(t);
    }
  }

  const avgPrice = priceN ? priceSum / priceN : 0; // tính giá trung bình 
  let topCondition = null;
  let topCondN = 0;
  // tìm tình trạng xuất hiện nhiều nhất để tính toán điểm
  for (const [cond, n] of conditionCounts) {
    if (n > topCondN) {
      topCondN = n;
      topCondition = cond;
    }
  }

  const preferredCategories = [...categoryWeights.entries()]
    .sort((a, b) => b[1] - a[1]) // danh mục hay xuất hiện xếp trước
    .slice(0, 12)
    .map(([id]) => toObjectId(id));

  // các điều kiện lọc sản phẩm: còn bán + ko phải của chính user đó + không đã tương tác
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
    category: { $in: preferredCategories }, // lọc theo danh mục ưu tiên
  })
    .select(selectFields)
    .limit(280)
    .lean()
    .maxTimeMS(AGG_MAX_TIME_MS);

  // nếu số lượng ứng viên ít hơn số lượng tối thiểu cần thiết -> tìm thêm
  if (candidates.length < Math.max(limitN * 6, 36)) {
    const more = await Product.find(baseMatch) // tìm thêm sản phẩm còn lại
      .select(selectFields)
      .sort({ updatedAt: -1 }) // sắp xếp theo thời gian cập nhật giảm dần
      .limit(220)
      .lean()
      .maxTimeMS(AGG_MAX_TIME_MS);

    // gộp không trùng lặp sản phẩm đã tìm thấy
    const seen = new Set(candidates.map((c) => String(c._id)));
    for (const m of more) {
      const id = String(m._id);
      if (!seen.has(id)) {
        seen.add(id);
        candidates.push(m); // chỉ thêm nếu chưa có trong mảng candidates
      }
    }
  }

  // chấm điểm các sản phẩm còn lại
  const scored = [];
  for (const c of candidates) {
    const catW = categoryWeights.get(String(c.category)) || 0; // Bao nhiêu lần trong profile có món cùng category với tin c? Không có trong map → 0.
    const candTokens = tokenizeProductText(c); // Tách từ từ tên/mô tả/thuộc tính của c
    const dice = diceCoefficient(profileTokenSet, candTokens); //  chỉ số Dice (0→1): càng nhiều từ khớp gu càng cao.
    let score = catW * 4 + dice * 14; // Điểm nền: hệ số 14 nhấn mạnh giống chữ, 4 nhấn danh mục (số lần xuất hiện trong profile)

    // Nếu c.condition trùng topCondition -> tăng điểm
    if (topCondition && c.condition === topCondition) score += 1.6;

    // Nếu giá trong khoảng 30-320% giá trung bình -> tăng điểm
    if (avgPrice > 0) {
      const pr = Number(c.price) || 0; // lấy giá sản phẩm
      if (pr >= avgPrice * 0.3 && pr <= avgPrice * 3.2) score += 1.1;
    }

    if (c.isVIP) score += VIP_BOOST; // tin VIP được cộng nhẹ

    if (score < 0.01) continue; // Bỏ tin gần như không liên quan

    scored.push({ doc: c, score, dice, catW });
  }

  scored.sort((a, b) => b.score - a.score); // điểm cao nhất lên đầu
  const top = scored.slice(0, limitN);

  const raw = top.map((t) => ({
    ...t.doc,
    recommendation: {
      score: t.score, // điểm tương tác tổng cộng của sản phẩm ứng viên đã tính ở STAGE E
      method: "content", // báo là gợi ý content-based
      textSimilarity: Math.round(t.dice * 1000) / 1000, // Dice làm tròn 3 chữ thập phân cho client
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

  // chuẩn hóa limitN
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

// gọi hybrid (CF + Content-Based) -> cache Redis + Mongo
exports.computeAndCacheRecommendations = async (userIdRaw, options = {}) => {
  // tính toán gợi ý hybrid (CF + CBF)
  const result = await exports.getHybridRecommendationsService(
    userIdRaw,
    options,
  );

  // xác định nguồn gợi ý - empty nếu không có sản phẩm
  let source = "empty";

  // nếu có sản phẩm -> xác định nguồn gợi ý
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

  const computedAt = new Date(); // lúc tính xong Datr
  const expiresAt = new Date(computedAt.getTime() + MONGO_CACHE_TTL_SEC * 1000); // thời gian tồn tại của cache trong Mongo (giây)

  const payload = {
    userId: String(userIdRaw),
    products: result.products,
    source,
    seedCount: result.debug?.cf?.seedCount ?? 0, // số lượng sản phẩm đã tương tác
    similarUsersCount: result.debug?.cf?.similarUsersCount ?? 0, // số lượng user đã tương tác
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

// hàm lấy gợi ý cho user - 2 tầng cache (Redis L1 + Mongo L2) - hàm chính API gọi - ưu tiên đọc cache trước, tính toán lại nếu miss
exports.getRecommendationsForUser = async (userIdRaw, options = {}) => {
  // kiểm tra forceRefresh: true thì bỏ Redis và Mongo, đi thẳng tính lại (computeAndCacheRecommendations).
  const { forceRefresh = false, limit } = options;
  const userIdStr = String(userIdRaw || "").trim(); // chuẩn hóa userId

  if (!mongoose.isValidObjectId(userIdStr)) { 
    throw new Error("Mã người dùng không hợp lệ.");
  }

  // Tầng 1: Resdis (nhanh nhất)
  if (!forceRefresh) {
    const cached = await redisCache.getCache(userIdStr); // lấy cache từ Redis
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

  // Tầng 2: Mongo - UserRecommendation
  if (!forceRefresh) {
    // lấy cache từ Mongo
    const doc = await UserRecommendation.findOne({ userId: userIdStr })
      .lean()
      .maxTimeMS(AGG_MAX_TIME_MS);

    if (doc) {
      const ageMs = Date.now() - new Date(doc.computedAt).getTime(); // tính tuổi cache trong Mongo (ms)
      const isFresh = ageMs < MONGO_CACHE_STALE_AFTER_SEC * 1000; // nếu tuổi cache < ngưỡng thời gian ôi thiu -> cache vẫn còn tốt

      if (isFresh) {
        // làm nóng cache Redis (best-effort) - ko chặn res nếu redis lỗi
        redisCache
          .setCache(userIdStr, {
            products: doc.products,
            source: doc.source,
            computedAt: new Date(doc.computedAt).toISOString(),
          })
          .catch(() => {});

        // trả về cache từ Mongo
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
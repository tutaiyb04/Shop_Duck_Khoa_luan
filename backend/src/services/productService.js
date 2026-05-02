const mongoose = require("mongoose");
const Product = require("../model/Product");
const User = require("../model/User");
const Category = require("../model/Category");
const notificationService = require("./notificationService");
const { escapeRegexForSearch } = require("../utils/escapeRegex");
const { applyExtraListingFilters } = require("../helper/productHelper");
const { uploadProductImageBuffers } = require("../config/cloudinary");
const { cancelPendingVipTransactionsForProduct } = require("./paymentService");
const { notifyProductChatLocked } = require("../utils/chatSocketNotify");
const {
  parseCategoryObjectIdFilter,
  buildCategoryFilterQuery,
  attachCategoryNamesToAdminProducts,
} = require("../helper/categoryHelper");
const {
  stripExpiredVipFlags,
  stripExpiredVipFlagsMany,
} = require("../helper/vipProductHelper");



exports.getAllProductsService = async (filters = {}) => {
  try {
    const {
      search: rawSearch,
      lat,
      lng,
      radius = 5000,
      page = 1,
      limit = 20,
      category: rawCategory,
      minPrice,
      maxPrice,
      condition,
      province,
      vipOnly,
    } = filters;

    const search = (rawSearch || "").trim();

    const categoryStr = (rawCategory || "").toString().trim();
    const categoryId =
      categoryStr && mongoose.isValidObjectId(categoryStr)
        ? new mongoose.Types.ObjectId(categoryStr)
        : null;
    const categoryMongoFilter = categoryId
      ? await buildCategoryFilterQuery(categoryId)
      : null;

    const limitN = parseInt(limit, 10) || 20;
    const pageN = parseInt(page, 10) || 1;
    const skip = (pageN - 1) * limitN;
    const lngN = parseFloat(lng);
    const latN = parseFloat(lat);
    const hasValidGeo =
      lat && lng && Number.isFinite(lngN) && Number.isFinite(latN);
    const maxDistanceM = parseInt(radius, 10) || 5000;

    if (hasValidGeo) {
      const geoQuery = { status: "AVAILABLE" };
      if (vipOnly) {
        geoQuery.isVIP = true;
      }

      if (search) {
        geoQuery.name = {
          $regex: escapeRegexForSearch(search),
          $options: "i",
        };
      }
      if (categoryMongoFilter) {
        geoQuery.category = categoryMongoFilter;
      }
      applyExtraListingFilters(geoQuery, {
        minPrice,
        maxPrice,
        condition,
        province,
      });

      // Khách có bật định vị (Tìm đồ quanh đây)
      const geoNearStage = {
        $geoNear: {
          key: "location",
          near: { type: "Point", coordinates: [lngN, latN] },
          distanceField: "distance",
          maxDistance: maxDistanceM,
          spherical: true,
          query: geoQuery,
        },
      };

      const pipeline = [
        geoNearStage,
        { $sort: { isVIP: -1, distance: 1 } },
        { $skip: skip },
        { $limit: limitN },
        {
          $lookup: {
            from: User.collection.name,
            let: { sid: "$sellerId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$sid"] } } },
              { $project: { username: 1, avatar: 1 } },
            ],
            as: "sellerIdArr",
          },
        },
        { $unwind: { path: "$sellerIdArr", preserveNullAndEmptyArrays: true } },
        { $addFields: { sellerId: "$sellerIdArr" } },
        {
          $lookup: {
            from: Category.collection.name,
            let: { cid: "$category" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$cid"] } } },
              { $project: { name: 1 } },
            ],
            as: "categoryArr",
          },
        },
        { $unwind: { path: "$categoryArr", preserveNullAndEmptyArrays: true } },
        { $addFields: { category: "$categoryArr" } },
        { $project: { sellerIdArr: 0, categoryArr: 0 } },
      ];

      const [products, countAgg] = await Promise.all([
        Product.aggregate(pipeline),
        Product.aggregate([geoNearStage, { $count: "total" }]),
      ]);
      const total = countAgg[0]?.total || 0;

      stripExpiredVipFlagsMany(products);

      return {
        products,
        totalPages: Math.ceil(total / limitN),
        currentPage: pageN,
      };
    }

    // Khách lướt web bình thường (Không dùng định vị)
    let query = { status: "AVAILABLE" };
    if (vipOnly) {
      query.isVIP = true;
    }
    
    if (search) {
      query.name = {
        $regex: escapeRegexForSearch(search),
        $options: "i",
      };
    }
    if (categoryMongoFilter) {
      query.category = categoryMongoFilter;
    }
    applyExtraListingFilters(query, {
      minPrice,
      maxPrice,
      condition,
      province,
    });

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("sellerId", "username avatar")
        .populate("category", "name")
        .sort({ isVIP: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limitN)
        .lean(),
      Product.countDocuments(query),
    ]);

    stripExpiredVipFlagsMany(products);

    return {
      products,
      totalPages: Math.ceil(total / limitN),
      currentPage: pageN,
    };
  } catch (error) {
    console.error("Lỗi tại getAllProductsService: ", error);
    throw new Error("Không thể lấy danh sách sản phẩm");
  }
};

exports.getSellerCatalogGroupedService = async (sellerIdRaw) => {
  const sellerIdStr = String(sellerIdRaw || "").trim();
  if (!mongoose.isValidObjectId(sellerIdStr)) {
    throw new Error("Mã shop không hợp lệ.");
  }

  const oid = new mongoose.Types.ObjectId(sellerIdStr);

  const user = await User.findOne({
    _id: oid,
    status: "active",
  })
    .select(
      "username avatar sellerProfile rating isEmailVerified authType role",
    )
    .lean();

  if (!user) {
    throw new Error("Không tìm thấy shop.");
  }

  const [totalProducts, totalSold, products] = await Promise.all([
    Product.countDocuments({ sellerId: oid }),
    Product.countDocuments({ sellerId: oid, status: "SOLD" }),
    Product.find({ sellerId: oid, status: "AVAILABLE" })
      .populate("category", "name")
      .sort({ isVIP: -1, updatedAt: -1 })
      .lean(),
  ]);

  stripExpiredVipFlagsMany(products);

  const groupsMap = new Map();
  for (const p of products) {
    const cat = p.category;
    const key = cat?._id ? String(cat._id) : "__other__";
    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        categoryId: cat?._id || null,
        categoryName: cat?.name?.trim() || "Khác",
        products: [],
      });
    }
    groupsMap.get(key).products.push(p);
  }

  const groups = Array.from(groupsMap.values()).sort((a, b) =>
    String(a.categoryName).localeCompare(String(b.categoryName), "vi", {
      sensitivity: "base",
    }),
  );

  const seller = {
    ...user,
    totalProducts,
    totalSold,
  };

  return { seller, groups };
};

/** Gian hàng công khai: danh sách sản phẩm có lọc danh mục / giá / tình trạng + phân trang. */
exports.getSellerShopListingService = async (sellerIdRaw, filters = {}) => {
  const sellerIdStr = String(sellerIdRaw || "").trim();
  if (!mongoose.isValidObjectId(sellerIdStr)) {
    throw new Error("Mã shop không hợp lệ.");
  }

  const oid = new mongoose.Types.ObjectId(sellerIdStr);

  const user = await User.findOne({
    _id: oid,
    status: "active",
  })
    .select(
      "username avatar sellerProfile rating isEmailVerified authType role",
    )
    .lean();

  if (!user) {
    throw new Error("Không tìm thấy shop.");
  }

  const [totalProducts, totalSold] = await Promise.all([
    Product.countDocuments({ sellerId: oid }),
    Product.countDocuments({ sellerId: oid, status: "SOLD" }),
  ]);

  const seller = {
    ...user,
    totalProducts,
    totalSold,
  };

  const {
    page = 1,
    limit = 12,
    category: rawCategory,
    minPrice,
    maxPrice,
    condition,
  } = filters;

  const limitN = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 48);
  const pageN = Math.max(parseInt(page, 10) || 1, 1);
  const skip = (pageN - 1) * limitN;

  const baseQuery = { sellerId: oid, status: "AVAILABLE" };

  const categoryStr = (rawCategory || "").toString().trim();
  const categoryId =
    categoryStr && mongoose.isValidObjectId(categoryStr)
      ? new mongoose.Types.ObjectId(categoryStr)
      : null;
  const categoryMongoFilter = categoryId
    ? await buildCategoryFilterQuery(categoryId)
    : null;

  const productQuery = { ...baseQuery };
  if (categoryMongoFilter) {
    productQuery.category = categoryMongoFilter;
  }
  applyExtraListingFilters(productQuery, {
    minPrice,
    maxPrice,
    condition,
    province: "",
  });

  const [products, total, categoryIds] = await Promise.all([
    Product.find(productQuery)
      .populate("sellerId", "username avatar")
      .populate("category", "name")
      .sort({ isVIP: -1, updatedAt: -1 })
      .skip(skip)
      .limit(limitN)
      .lean(),
    Product.countDocuments(productQuery),
    Product.distinct("category", baseQuery),
  ]);

  stripExpiredVipFlagsMany(products);

  const validCatIds = categoryIds.filter(
    (id) => id && mongoose.isValidObjectId(String(id)),
  );
  const filterCategoriesRaw = await Category.find({ _id: { $in: validCatIds } })
    .select("name")
    .lean();
  const filterCategories = [...filterCategoriesRaw].sort((a, b) =>
    String(a.name || "").localeCompare(String(b.name || ""), "vi", {
      sensitivity: "base",
    }),
  );

  return {
    seller,
    filterCategories,
    products,
    pagination: {
      currentPage: pageN,
      totalPages: Math.max(1, Math.ceil(total / limitN)),
      totalItems: total,
    },
  };
};

exports.getAdminProductsService = async (filters) => {
  try {
    const {
      search: rawSearch,
      category,
      status,
      page = 1,
      limit = 20,
    } = filters;
    const search = (rawSearch || "").trim();
    let query = {};

    if (search) {
      query.name = {
        $regex: escapeRegexForSearch(search),
        $options: "i",
      };
    }
    const categoryStr = parseCategoryObjectIdFilter(category);
    if (categoryStr) {
      const categoryMongoFilter = await buildCategoryFilterQuery(
        new mongoose.Types.ObjectId(categoryStr),
      );
      if (categoryMongoFilter) query.category = categoryMongoFilter;
    }
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Chạy song song lệnh đếm và lệnh tìm (category gắn tay — xem attachCategoryNamesToAdminProducts)
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("sellerId", "username email avatar")
        .sort({ isVIP: -1, updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(query),
    ]);
    await attachCategoryNamesToAdminProducts(products);

    stripExpiredVipFlagsMany(products);

    return {
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    };
  } catch (error) {
    console.error("Lỗi tại getAdminProductsService: ", error);
    throw new Error("Không thể tải danh sách sản phẩm quản trị");
  }
};

exports.getProductByIdService = async (id) => {
  try {
    const product = await Product.findById(id)
      .populate(
        "sellerId",
        "username email avatar phone isEmailVerified sellerProfile authType role rating",
      )
      .populate("category", "name")
      .lean();

    if (!product) {
      throw new Error("Sản phẩm không tồn tại");
    }

    stripExpiredVipFlags(product);

    const rawSellerId = product.sellerId?._id || product.sellerId;
    const rawCategoryId = product.category?._id || product.category;

    let totalProducts = 0;
    let totalSold = 0;
    let relatedProducts = [];
    let recommendedProducts = [];

    if (rawSellerId && rawCategoryId) {
      [totalProducts, totalSold, relatedProducts, recommendedProducts] =
        await Promise.all([
          Product.countDocuments({ sellerId: rawSellerId }),
          Product.countDocuments({ sellerId: rawSellerId, status: "SOLD" }),

          // Sản phẩm liên quan
          Product.find({
            category: rawCategoryId,
            _id: { $ne: id },
            status: "AVAILABLE",
          })
            .sort({ createdAt: -1 })
            .limit(8)
            .lean(),

          // Có thể bạn sẽ thích
          Product.aggregate([
            {
              $match: {
                category: rawCategoryId,
                _id: { $ne: product._id }, // product._id đã được lấy an toàn
                status: "AVAILABLE",
              },
            },
            { $sample: { size: 3 } },
          ]),
        ]);
    }

    stripExpiredVipFlagsMany(relatedProducts);
    stripExpiredVipFlagsMany(recommendedProducts);

    if (product.sellerId && typeof product.sellerId === "object") {
      product.sellerId.totalProducts = totalProducts;
      product.sellerId.totalSold = totalSold;
    }

    return {
      product,
      relatedProducts,
      recommendedProducts,
    };
  } catch (error) {
    console.error("Lỗi tại getProductByIdService: ", error);
    throw new Error("Không thể lấy thông tin chi tiết sản phẩm");
  }
};

exports.createProductService = async (sellerId, productData, files) => {
  try {
    const {
      name,
      category,
      price,
      quantity,
      condition,
      description,
      lat,
      lng,
      address,
      attributes,
    } = productData;

    if (!mongoose.isValidObjectId(String(category || "").trim())) {
      throw new Error("Danh mục không hợp lệ — vui lòng chọn lại danh mục.");
    }

    const latN = parseFloat(lat);
    const lngN = parseFloat(lng);

    if (!Number.isFinite(latN) || !Number.isFinite(lngN)) {
      throw new Error(
        "Tọa độ không hợp lệ — vui lòng chọn vị trí trên bản đồ (click vào map).",
      );
    }

    if (latN < -90 || latN > 90 || lngN < -180 || lngN > 180) {
      throw new Error("Tọa độ vị trí nằm ngoài phạm vi cho phép.");
    }

    let imageUrls = [];

    try {
      imageUrls = await uploadProductImageBuffers(files || []);
    } catch (e) {
      console.error("Cloudinary upload:", e);
      throw new Error(
        "Không tải được ảnh lên — kiểm tra mạng hoặc cấu hình Cloudinary.",
      );
    }

    if (imageUrls.length === 0) {
      throw new Error("Vui lòng tải lên ít nhất 1 hình ảnh sản phẩm.");
    }

    let attrs = {};
    if (attributes != null && String(attributes).trim() !== "") {
      try {
        attrs = JSON.parse(attributes);
      } catch {
        throw new Error("Dữ liệu thuộc tính sản phẩm không đúng định dạng.");
      }
    }

    const newProduct = await Product.create({
      name,
      category,
      price: Number(price),
      quantity: Number(quantity),
      condition,
      description,
      attributes: attrs,
      images: imageUrls,
      sellerId,
      address,
      location: {
        type: "Point",
        coordinates: [lngN, latN], // GeoJSON: [kinh độ, vĩ độ]
      },
    });

    return { newProduct };
  } catch (error) {
    console.error("Lỗi tại createProductService: ", error);
    if (error instanceof mongoose.Error.ValidationError) {
      const parts = Object.values(error.errors || {}).map((e) => e.message);
      throw new Error(parts.length ? parts.join("; ") : error.message);
    }
    if (error instanceof mongoose.Error.CastError) {
      throw new Error(`Dữ liệu không hợp lệ: ${error.path}`);
    }
    if (error.code === 11000) {
      throw new Error("Trùng dữ liệu — không thể tạo sản phẩm.");
    }
    const msg = error.message || "Không thể tạo mới sản phẩm";
    throw new Error(msg);
  }
};

exports.updateProductStatusService = async (id, status, adminNote) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { status, adminNote },
      { returnDocument: "after", runValidators: true }, // FIX WARNING Mongoose
    );

    if (!updatedProduct) throw new Error("Không tìm thấy sản phẩm");

    const st = updatedProduct.status;
    if (st && !["PENDING", "AVAILABLE"].includes(String(st))) {
      await cancelPendingVipTransactionsForProduct(id).catch((e) =>
        console.error("cancelPendingVipTransactionsForProduct:", e),
      );
    }

    // Gửi thông báo cho người bán dựa vào trạng thái admin vừa set.
    // (bỏ qua nếu thiếu sellerId để tránh crash với dữ liệu cũ)
    if (updatedProduct.sellerId) {
      // tạo 1 phong bì chứa 3 thông tin bắt buộc cho 1 thông báo
      const baseArgs = {
        sellerId: updatedProduct.sellerId,
        productId: updatedProduct._id,
        productName: updatedProduct.name,
      };

      const onError = (tag) => (e) => console.error(`${tag}:`, e);

      // admin duyệt bài 
      if (st === "AVAILABLE") {
        notificationService
          .notifyProductApproved(baseArgs)
          .catch(onError("notifyProductApproved"));
      } 
      // admin từ chối
      else if (st === "REJECTED" || st === "LOCKED") {
        notificationService
          .notifyProductRejected({
            ...baseArgs,
            reason:
              adminNote ||
              (st === "LOCKED"
                ? "Bài đăng bị khoá bởi quản trị viên."
                : "Bài đăng không đạt điều kiện."),
          })
          .catch(onError("notifyProductRejected"));
      } 
      // admin ẩn bài
      else if (st === "HIDDEN") {
        notificationService
          .notifyProductHidden({ ...baseArgs, reason: adminNote || "" })
          .catch(onError("notifyProductHidden"));
      }
    }

    return { updatedProduct };
  } catch (error) {
    console.error("Lỗi tại updateProductStatusService: ", error);
    throw new Error(`Không thể cập nhật trạng thái thành ${status}`);
  }
};

exports.updateProductService = async (id, sellerId, updateData, files) => {
  try {
    // Bảo mật: Không cho phép update các trường nhạy cảm
    delete updateData.sellerId;
    delete updateData.status;
    delete updateData.adminNote;

    // FIX 1: Convert Map (Attributes) từ chuỗi JSON sang Object để chống lỗi Mongoose Iterator
    if (updateData.attributes && typeof updateData.attributes === "string") {
      updateData.attributes = JSON.parse(updateData.attributes);
    }

    let finalImages = [];
    // Lấy lại các ảnh cũ mà người dùng không xóa
    if (updateData.existingImages) {
      finalImages = Array.isArray(updateData.existingImages)
        ? [...updateData.existingImages]
        : [updateData.existingImages];
    }

    if (files && files.length > 0) {
      let newUrls = [];
      
      try {
        newUrls = await uploadProductImageBuffers(files);
      } catch (e) {
        console.error("Cloudinary upload (update):", e);
        throw new Error(
          "Không tải được ảnh mới — kiểm tra mạng hoặc cấu hình Cloudinary.",
        );
      }
      finalImages = [...finalImages, ...newUrls];
    }

    updateData.images = finalImages;
    delete updateData.existingImages;

    if (updateData.lat && updateData.lng) {
      updateData.location = {
        type: "Point",
        coordinates: [parseFloat(updateData.lng), parseFloat(updateData.lat)],
      };
      delete updateData.lat;
      delete updateData.lng;
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id, sellerId: sellerId },
      { $set: updateData },
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedProduct)
      throw new Error("Sản phẩm không tồn tại hoặc bạn không có quyền sửa");

    return { updatedProduct };
  } catch (error) {
    console.error("Lỗi tại updateProductService: ", error);
    throw new Error("Không thể cập nhật thông tin sản phẩm");
  }
};

exports.getMyProductsService = async (sellerId, page, limit, status) => {
  try {
    let query = { sellerId };

    if (status) {
      query.status = status;
    } else {
      query.status = { $ne: "HIDDEN" }; // Ẩn đi những bài đã xóa mềm mặc định
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    stripExpiredVipFlagsMany(products);

    return {
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalProducts: total,
    };
  } catch (error) {
    console.error("Lỗi tại getMyProductsService: ", error);
    throw new Error("Không thể tải danh sách sản phẩm của bạn");
  }
};

exports.updateMyProductStatusService = async (id, sellerId, status) => {
  try {
    // Phải kiểm tra đúng sellerId thì mới được đổi trạng thái (tránh hack đổi bài người khác)
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id, sellerId: sellerId },
      { $set: { status: status } },
      { returnDocument: "after", runValidators: true }, // FIX WARNING Mongoose
    );

    if (!updatedProduct) {
      throw new Error(
        "Sản phẩm không tồn tại hoặc bạn không có quyền thao tác",
      );
    }

    if (status === "SOLD" || status === "HIDDEN") {
      await cancelPendingVipTransactionsForProduct(id).catch((e) =>
        console.error("cancelPendingVipTransactionsForProduct:", e),
      );

      // Khoá khung chat của các hội thoại liên quan (Đã bán / Đã ẩn).
      notifyProductChatLocked(id, status).catch((e) =>
        console.error("notifyProductChatLocked:", e),
      );
    }

    return { updatedProduct };
  } catch (error) {
    console.error("Lỗi tại updateMyProductStatusService: ", error);
    throw new Error("Không thể cập nhật trạng thái sản phẩm");
  }
};

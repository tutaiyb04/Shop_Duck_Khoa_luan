const mongoose = require("mongoose");
const Product = require("../model/Product");
const User = require("../model/User");
const Category = require("../model/Category");
const { escapeRegexForSearch } = require("../utils/escapeRegex");

/** Lọc query admin: category chỉ khi đúng ObjectId (bỏ slug "khac", mảng lỗi, …) */
function parseCategoryObjectIdFilter(category) {
  if (category == null) return null;
  if (Array.isArray(category)) {
    for (const item of category) {
      const s = String(item ?? "").trim();
      if (s && mongoose.isValidObjectId(s)) return s;
    }
    return null;
  }
  const s = String(category).trim();
  if (!s || !mongoose.isValidObjectId(s)) return null;
  return s;
}

/**
 * Gắn tên danh mục cho danh sách admin, không dùng populate (tránh CastError
 * nếu DB có `category: "khac"` / chuỗi thay vì ref ObjectId).
 */
async function attachCategoryNamesToAdminProducts(products) {
  if (!products?.length) return;
  const idSet = new Set();
  for (const p of products) {
    const c = p.category;
    if (c == null) continue;
    const idStr = typeof c === "object" && c?._id != null ? String(c._id) : String(c);
    if (mongoose.isValidObjectId(idStr)) idSet.add(idStr);
  }
  const byId = new Map();
  if (idSet.size > 0) {
    const rows = await Category.find({ _id: { $in: [...idSet] } })
      .select("name")
      .lean();
    for (const r of rows) byId.set(String(r._id), r);
  }
  for (const p of products) {
    const c = p.category;
    if (c == null) {
      p.category = { name: "Khác" };
      continue;
    }
    const idStr = typeof c === "object" && c?._id != null ? String(c._id) : String(c);
    if (mongoose.isValidObjectId(idStr) && byId.has(idStr)) {
      p.category = byId.get(idStr);
    } else {
      p.category = { name: "Khác" };
    }
  }
}

exports.getAllProductsService = async (filters = {}) => {
  try {
    const {
      search: rawSearch,
      lat,
      lng,
      radius = 5000,
      page = 1,
      limit = 20,
    } = filters;
    const search = (rawSearch || "").trim();

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
      if (search) {
        geoQuery.name = {
          $regex: escapeRegexForSearch(search),
          $options: "i",
        };
      }

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

      return {
        products,
        totalPages: Math.ceil(total / limitN),
        currentPage: pageN,
      };
    }

    let query = { status: "AVAILABLE" };
    if (search) {
      query.name = {
        $regex: escapeRegexForSearch(search),
        $options: "i",
      };
    }

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
    const categoryId = parseCategoryObjectIdFilter(category);
    if (categoryId) query.category = categoryId;
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
        "username email avatar phone isEmailVerified sellerProfile authType",
      )
      .populate("category", "name")
      .lean();

    if (!product) {
      throw new Error("Sản phẩm không tồn tại");
    }

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

    const imageUrls = files?.map((file) => file.path) || [];

    if (imageUrls.length === 0) {
      throw new Error("Vui lòng tải lên ít nhất 1 hình ảnh sản phẩm.");
    }

    const newProduct = await Product.create({
      name,
      category,
      price: Number(price),
      quantity: Number(quantity),
      condition,
      description,
      attributes: attributes ? JSON.parse(attributes) : {},
      images: imageUrls,
      sellerId,
      address,
      location: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)], // Chuẩn GeoJSON: [Kinh độ, Vĩ độ]
      },
    });

    return { newProduct };
  } catch (error) {
    console.error("Lỗi tại createProductService: ", error);
    throw new Error("Không thể tạo mới sản phẩm");
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
      finalImages = [...finalImages, ...files.map((file) => file.path)];
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

    return { updatedProduct };
  } catch (error) {
    console.error("Lỗi tại updateMyProductStatusService: ", error);
    throw new Error("Không thể cập nhật trạng thái sản phẩm");
  }
};

const Product = require("../model/Product");

exports.getAllProductsService = async (filters = {}) => {
  try {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({ status: "AVAILABLE" })
        .populate("sellerId", "username avatar")
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // Trả về JSON thuần, siêu nhẹ siêu nhanh
      Product.countDocuments({ status: "AVAILABLE" }),
    ]);

    return {
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Lỗi tại getAllProductsService: ", error);
    throw new Error("Không thể lấy danh sách sản phẩm");
  }
};

exports.getAdminProductsService = async (filters) => {
  try {
    const { search, category, status, page = 1, limit = 20 } = filters;
    let query = {};

    if (search) query.name = { $regex: search, $options: "i" };
    if (category) query.category = category;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Chạy song song lệnh đếm và lệnh tìm
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category", "name")
        .populate("sellerId", "username email avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(query),
    ]);

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
          Product.countDocuments({ rawSellerId }),
          Product.countDocuments({ rawSellerId, status: "SOLD" }),

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
      { new: true, runValidators: true },
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

    if (files && files.length > 0) {
      updateData.images = files.map((file) => file.path);
    }

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
      { new: true, runValidators: true },
    );

    if (!updatedProduct)
      throw new Error("Sản phẩm không tồn tại hoặc bạn không có quyền sửa");

    return { updatedProduct };
  } catch (error) {
    console.error("Lỗi tại updateProductService: ", error);
    throw new Error("Không thể cập nhật thông tin sản phẩm");
  }
};

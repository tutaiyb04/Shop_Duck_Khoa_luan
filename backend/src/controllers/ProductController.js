const productService = require("../services/productService");

exports.getAllProducts = async (req, res) => {
  try {
    const filters = {
      search: req.query.search || req.query.q || "",
      lat: req.query.lat, // Vĩ độ
      lng: req.query.lng, // Kinh độ
      radius: req.query.radius, // Bán kính (mét)
      category: req.query.category || "",
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    };

    const { products, totalPages, currentPage } =
      await productService.getAllProductsService(filters);

    return res.status(200).json({
      message: "Lấy danh sách sản phẩm thành công",
      products,
      pagination: {
        totalPages,
        currentPage,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm: ", error);
    return res.status(500).json({
      message: error.message || "Lỗi server khi lấy danh sách sản phẩm",
    });
  }
};

exports.getAdminProducts = async (req, res) => {
  try {
    const filters = {
      search: req.query.search || "",
      category: req.query.category || "",
      status: req.query.status || "",
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 15,
    };

    const { products, totalPages, currentPage } =
      await productService.getAdminProductsService(filters);

    res.status(200).json({
      message: "Lấy danh sách sản phẩm thành công",
      products: products,
      totalPages,
      currentPage,
    });
  } catch (error) {
    console.error("Lỗi tại getAdminProducts:", error);
    res.status(500).json({ message: error || "Lỗi server khi tải sản phẩm" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const { product, relatedProducts, recommendedProducts } =
      await productService.getProductByIdService(id);

    return res.status(200).json({
      message: "Lấy chi tiết sản phẩm thành công",
      product,
      relatedProducts,
      recommendedProducts,
    });
  } catch (error) {
    console.error("Lỗi tại getProductById:", error);
    return res.status(404).json({ message: error.message || "Lỗi server" });
  }
};

exports.updateAdminProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const { updatedProduct } = await productService.updateProductStatusService(
      id,
      status,
      note,
    );

    res.status(200).json({
      message: "Cập nhật trạng thái sản phẩm thành công",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Lỗi tại updateAdminProductStatus:", error);
    res.status(500).json({ message: error || "Lỗi server khi tải sản phẩm" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    // 1. Kiểm tra xác thực (đã có req.user từ middleware protect)
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Vui lòng đăng nhập để đăng bán" });
    }

    const sellerId = req.user._id || req.user.id;
    const productData = req.body;
    const files = req.files;

    const { newProduct } = await productService.createProductService(
      sellerId,
      productData,
      files,
    );

    return res.status(201).json({
      message: "Đăng tin bán thành công",
      product: newProduct,
    });
  } catch (error) {
    console.error("Lỗi khi tạo sản phẩm: ", error);
    return res
      .status(500)
      .json({ message: error.message || "Lỗi server khi đăng tin" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    // 1. Kiểm tra đăng nhập
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Vui lòng đăng nhập để chỉnh sửa" });
    }

    const sellerId = req.user._id || req.user.id;
    const { id } = req.params; // ID của sản phẩm cần sửa
    const updateData = req.body;
    const files = req.files; // Ảnh mới (nếu có)

    // 2. Gọi Service để cập nhật (Service đã tự xử lý bảo mật sellerId)
    const { updatedProduct } = await productService.updateProductService(
      id,
      sellerId,
      updateData,
      files,
    );

    return res.status(200).json({
      message: "Cập nhật sản phẩm thành công",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm: ", error);
    return res
      .status(500)
      .json({ message: error.message || "Lỗi server khi cập nhật" });
  }
};

exports.getMyProducts = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    const sellerId = req.user._id || req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || "";

    const { products, totalPages, currentPage, totalProducts } =
      await productService.getMyProductsService(sellerId, page, limit, status);

    return res.status(200).json({
      message: "Lấy danh sách sản phẩm của bạn thành công",
      products,
      totalPages,
      currentPage,
      totalProducts,
    });
  } catch (error) {
    console.error("Lỗi tại getMyProducts: ", error);
    return res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

exports.updateMyProductStatus = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    const sellerId = req.user._id || req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    if (!["HIDDEN", "SOLD"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Trạng thái cập nhật không hợp lệ" });
    }

    const { updatedProduct } =
      await productService.updateMyProductStatusService(id, sellerId, status);

    return res.status(200).json({
      message:
        status === "HIDDEN"
          ? "Đã ẩn sản phẩm thành công"
          : "Đã chuyển sang trạng thái Đã Bán",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Lỗi tại updateMyProductStatus: ", error);
    return res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

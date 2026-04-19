const productService = require("../services/productService");

exports.getAllProducts = async (req, res) => {
  try {
    // Chỉ lấy sản phẩm "active", dùng populate để lấy name & avatar từ User (người bán)
    const { products } = await productService.getAllProductsService();

    return res.status(200).json({
      message: "Lấy danh sách sản phẩm thành công",
      products,
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
    };

    const { products } = await productService.getAdminProductsService(filters);

    res.status(200).json({
      message: "Lấy danh sách sản phẩm thành công",
      products: products,
    });
  } catch (error) {
    console.error("Lỗi tại getAdminProducts:", error);
    res.status(500).json({ message: error || "Lỗi server khi tải sản phẩm" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const { product } = await productService.getProductByIdService(id);

    return res.status(200).json({
      message: "Lấy chi tiết sản phẩm thành công",
      product,
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

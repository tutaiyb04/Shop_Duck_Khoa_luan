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

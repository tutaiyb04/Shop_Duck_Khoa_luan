// controllers/ProductController.js
const Product = require("../model/Product");

exports.createProduct = async (req, res) => {
  try {
    // 1. Kiểm tra xác thực (đã có req.user từ middleware protect)
    if (!req.user) {
      return res.status(401).json({ message: "Vui lòng đăng nhập để đăng bán!" });
    }

    const sellerId = req.user._id || req.user.id;
    const { name, category, price, condition, description, shippingInfo } = req.body;

    // 2. Lấy danh sách link ảnh đã được Cloudinary xử lý
    // Khi dùng upload.array, multer sẽ lưu thông tin các file vào req.files
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        imageUrls.push(file.path); // file.path chính là đường dẫn URL của ảnh trên Cloudinary
      }
    }

    // Kiểm tra phải có ít nhất 1 ảnh
    if (imageUrls.length === 0) {
      return res.status(400).json({ message: "Vui lòng tải lên ít nhất 1 hình ảnh sản phẩm." });
    }

    // 3. Tạo mới sản phẩm
    const newProduct = new Product({
      name,
      category,
      price: Number(price), // Đảm bảo lưu dưới dạng số
      condition,
      description,
      shippingInfo,
      images: imageUrls,
      sellerId: sellerId,
    });

    // 4. Lưu vào Database
    await newProduct.save();

    res.status(201).json({
      message: "Đăng tin bán thành công!",
      product: newProduct,
    });
  } catch (error) {
    console.error("Lỗi khi tạo sản phẩm: ", error);
    res.status(500).json({ message: error.message || "Lỗi server khi đăng tin." });
  }
};
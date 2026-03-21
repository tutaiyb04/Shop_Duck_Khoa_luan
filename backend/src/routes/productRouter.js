    // routes/productRouter.js
const express = require("express");
const router = express.Router();

const productController = require("../controllers/ProductController");
const { protect } = require("../middleware/authMiddleware"); // Chặn người chưa đăng nhập
const { upload } = require("../config/cloudinary"); // Middleware xử lý ảnh

// API: POST /api/products
// upload.array("images", 5) phải khớp với key "images" trong FormData ở Frontend
router.post(
  "/create-product",
  protect, // Xác thực JWT
  upload.array("images", 5), // Bắt tối đa 5 file ảnh có key là 'images'
  productController.createProduct // Hàm xử lý logic lưu DB
);

module.exports = router;
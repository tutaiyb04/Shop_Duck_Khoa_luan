const express = require("express");
const router = express.Router();
const { createReview } = require("../controllers/ReviewController");
const { protect } = require("../middleware/authMiddleware"); // Import middleware bảo mật của bạn bạn

// Route tạo đánh giá (Yêu cầu đăng nhập - dùng middleware protect)
router.post("/", protect, createReview);

module.exports = router;
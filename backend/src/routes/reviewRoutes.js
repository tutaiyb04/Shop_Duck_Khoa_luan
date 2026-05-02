const express = require("express");
const router = express.Router();
const {
  createReview,
  listSellerReviews,
} = require("../controllers/ReviewController");
const { protect } = require("../middleware/authMiddleware"); // Import middleware bảo mật của bạn bạn

router.get("/seller/:sellerId", listSellerReviews);
router.post("/", protect, createReview);

module.exports = router;

const reviewService = require("../services/reviewServices");

exports.createReview = async (req, res) => {
  try {
    // Kiểm tra an toàn biến req.user từ middleware (giống UserController)
    if (!req.user) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    const buyerId = req.user._id || req.user.id;
    const { sellerId, productId, rating, comment } = req.body;

    const { newReview } = await reviewService.createReviewService(
      buyerId, sellerId, productId, rating, comment
    );

    res.status(201).json({
      message: "Gửi đánh giá thành công",
      review: newReview,
    });
  } catch (error) {
    console.log("Lỗi khi gọi createReview: ", error);
    // Trả về HTTP Status 400 cho lỗi logic (như spam, chưa mua hàng)
    res.status(400).json({ message: error.message || "Lỗi server" });
  }
};
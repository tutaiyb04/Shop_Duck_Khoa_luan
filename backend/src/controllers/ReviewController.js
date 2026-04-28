const reviewService = require("../services/reviewServices");

exports.createReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    const buyerId = req.user._id || req.user.id;
    const { orderId, rating, comment } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Thiếu mã đơn hàng (orderId)" });
    }

    const { newReview } = await reviewService.createReviewService(
      buyerId,
      orderId,
      rating,
      comment,
    );

    res.status(201).json({
      message: "Gửi đánh giá thành công",
      review: newReview,
    });
  } catch (error) {
    console.log("Lỗi khi gọi createReview: ", error);
    res.status(400).json({ message: error.message || "Lỗi server" });
  }
};

const reviewService = require("../services/reviewServices");

exports.listSellerReviews = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const data = await reviewService.listReviewsBySellerService(
      sellerId,
      page,
      limit,
    );

    return res.status(200).json({
      message: "Lấy đánh giá thành công",
      reviews: data.reviews,
      pagination: data.pagination,
    });
  } catch (error) {
    console.error("Lỗi listSellerReviews:", error);
    const msg = error.message || "Lỗi server";

    if (msg.includes("không hợp lệ")) {
      return res.status(400).json({ message: msg });
    }

    if (msg.includes("Không tìm thấy shop")) {
      return res.status(404).json({ message: msg });
    }

    return res.status(500).json({ message: msg });
  }
};

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

const mongoose = require("mongoose");
const Review = require("../model/Review");
const User = require("../model/User");
const Order = require("../model/Order");

exports.createReviewService = async (buyerId, sellerId, productId, rating, comment) => {
  // Kiểm tra đơn hàng đã hoàn tất chưa (Bạn có thể comment đoạn này lại nếu chưa có data Order để test)
  const order = await Order.findOne({ buyerId, productId, status: "COMPLETED" });
  if (!order) {
    throw new Error("Chỉ được đánh giá khi giao dịch thành công");
  }

  // Kiểm tra chống Spam
  const existingReview = await Review.findOne({ buyerId, productId });
  if (existingReview) {
    throw new Error("Bạn đã đánh giá sản phẩm này rồi");
  }

  // Dùng Transaction để an toàn dữ liệu
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Tạo Review mới
    const newReview = new Review({ buyerId, sellerId, productId, rating, comment });
    await newReview.save({ session });

    // 2. Tính lại điểm trung bình
    const stats = await Review.aggregate([
      { $match: { sellerId: new mongoose.Types.ObjectId(sellerId) } },
      { $group: { _id: "$sellerId", averageRating: { $avg: "$rating" } } }
    ]).session(session);

    // 3. Cập nhật lại vào trường "rating" của bảng User (theo đúng Schema của bạn bạn)
    if (stats.length > 0) {
      const roundedRating = Math.round(stats[0].averageRating * 10) / 10;
      await User.findByIdAndUpdate(sellerId, { rating: roundedRating }, { session });
    }

    await session.commitTransaction();
    session.endSession();

    return { newReview };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
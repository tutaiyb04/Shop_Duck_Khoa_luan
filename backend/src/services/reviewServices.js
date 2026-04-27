const mongoose = require("mongoose");
const Review = require("../model/Review");
const User = require("../model/User");
const Order = require("../model/Order");

exports.createReviewService = async (buyerId, sellerId, productId, rating, comment) => {
  // Kiểm tra đơn hàng đã hoàn tất chưa 
  const order = await Order.findOne({ buyerId, productId, status: "COMPLETED" })
    .sort({ createdAt: -1 });

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
    // Tạo Review mới
    const newReview = new Review({
      buyerId,
      sellerId,
      productId,
      orderId: order._id,
      rating,
      comment,
    });
    await newReview.save({ session });

    // Tính lại điểm trung bình
    const stats = await Review.aggregate([
      { $match: { sellerId: new mongoose.Types.ObjectId(sellerId) } },
      { $group: { _id: "$sellerId", averageRating: { $avg: "$rating" } } },
    ]).session(session);

    // Số lượt đánh giá (sellerProfile) + rating trung bình (user.rating)
    const reviewCount = await Review.countDocuments({
      sellerId: new mongoose.Types.ObjectId(sellerId),
    }).session(session);

    const update = { "sellerProfile.totalReviews": reviewCount };
    if (stats.length > 0) {
      const roundedRating = Math.round(stats[0].averageRating * 10) / 10;
      update.rating = roundedRating;
    }
    await User.findByIdAndUpdate(sellerId, { $set: update }, { session });

    await session.commitTransaction();
    session.endSession();

    return { newReview };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
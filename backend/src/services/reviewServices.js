const mongoose = require("mongoose");
const Review = require("../model/Review");
const User = require("../model/User");
const Order = require("../model/Order");
const Product = require("../model/Product");
const notificationService = require("./notificationService");


// Đánh giá gắn với một đơn COMPLETED — lấy sellerId/productId từ đơn để tránh giả mạo.

exports.createReviewService = async (buyerId, orderId, rating, comment) => {
  if (!mongoose.isValidObjectId(String(orderId))) {
    throw new Error("Mã đơn hàng không hợp lệ");
  }

  const oid = new mongoose.Types.ObjectId(String(orderId));
  const bid = new mongoose.Types.ObjectId(String(buyerId));

  // Kiểm tra đơn hàng có tồn tại và thuộc về người mua
  const order = await Order.findOne({
    _id: oid,
    buyerId: bid,
    status: "COMPLETED",
  }).lean();

  if (!order) {
    throw new Error(
      "Không thấy đơn hoàn tất hoặc đơn không thuộc về bạn — chỉ đánh giá sau khi mua thành công.",
    );
  }

  // Kiểm tra đã đánh giá đơn hàng này chưa- chống spam
  const existingReview = await Review.findOne({ orderId: oid }).lean();

  if (existingReview) {
    throw new Error("Bạn đã đánh giá đơn hàng này rồi");
  }

  const sellerId = order.sellerId;
  const productId = order.productId;

  // Tạo session để đảm bảo tính toàn vẹn dữ liệu - Giao dịch an toàn & Tạo Đánh giá (Transaction)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const newReview = new Review({
      buyerId: bid,
      sellerId,
      productId,
      orderId: oid,
      rating,
      comment,
    });
    await newReview.save({ session });

    const sid = new mongoose.Types.ObjectId(String(sellerId));

    // Tính toán điểm trung bình đánh giá của người bán
    const stats = await Review.aggregate([
      { $match: { sellerId: sid } },
      { $group: { _id: "$sellerId", averageRating: { $avg: "$rating" } } },
    ]).session(session);

    const reviewCount = await Review.countDocuments({ sellerId: sid }).session(
      session,
    );

    const update = { "sellerProfile.totalReviews": reviewCount };

    if (stats.length > 0) {
      const roundedRating = Math.round(stats[0].averageRating * 10) / 10;
      update.rating = roundedRating;
    }

    await User.findByIdAndUpdate(sellerId, { $set: update }, { session });

    await session.commitTransaction();
    session.endSession();

    // Sau khi commit thành công → gửi thông báo "Có đánh giá mới" cho người bán.
    // Helper notifyReviewReceived tự gom nhóm theo productId (groupKey) — nếu sản phẩm
    // nhận nhiều review chưa đọc, chúng sẽ cộng dồn thành 1 thông báo.
    Product.findById(productId)
      .select("name")
      .lean()
      .then((p) =>
        notificationService.notifyReviewReceived({
          sellerId,
          productId,
          actorId: bid,
          rating,
          comment,
          productName: p?.name,
        }),
      )
      .catch((e) => console.error("notifyReviewReceived:", e));

    return { newReview };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error.code === 11000) {
      throw new Error("Bạn đã đánh giá đơn hàng này rồi");
    }
    throw error;
  }
};

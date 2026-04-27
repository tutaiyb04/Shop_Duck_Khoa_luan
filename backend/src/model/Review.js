const mongoose = require("mongoose");

/**
 * Đánh giá gắn với một đơn hàng thành công (Order COMPLETED) — 1 order ≤ 1 review.
 * Dùng cập nhật điểm trung bình người bán (User.rating) trong `reviewServices`.
 */
const reviewSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true },
);

/** Một đơn chỉ một đánh giá */
reviewSchema.index({ orderId: 1 }, { unique: true });

/** Danh sách đánh giá theo thời gian */
reviewSchema.index({ sellerId: 1, createdAt: -1 });
reviewSchema.index({ productId: 1, createdAt: -1 });

/** Chống trùng theo từng cặp mua – sản phẩm (dùng trong service; có thể nới sau nếu cho phép nhiều lần mua) */
reviewSchema.index({ buyerId: 1, productId: 1 });

module.exports = mongoose.model("Review", reviewSchema);

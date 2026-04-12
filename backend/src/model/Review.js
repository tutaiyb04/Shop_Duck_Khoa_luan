const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
  },
  { timestamps: true },
);

// Đánh Index để tối ưu truy vấn khi load danh sách đánh giá của 1 người bán/sản phẩm
reviewSchema.index({ sellerId: 1 });
reviewSchema.index({ productId: 1 });

// QUAN TRỌNG: Đảm bảo 1 đơn hàng thành công chỉ được review đúng 1 lần
reviewSchema.index({ orderId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);

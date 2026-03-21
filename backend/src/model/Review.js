const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
  },
  { timestamps: true }
);

// Đánh Index để tối ưu truy vấn
reviewSchema.index({ sellerId: 1 });
reviewSchema.index({ buyerId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
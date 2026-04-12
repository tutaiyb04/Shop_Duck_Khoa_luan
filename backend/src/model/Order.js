const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "User" },
    sellerId: { type: Schema.Types.ObjectId, ref: "User" },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["COD", "VNPAY", "MOMO"],
      default: "COD",
    },
    shippingAddress: { type: String, required: true },
    trackingCode: { type: String, default: "" },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "SHIPPING", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);

orderSchema.index({ buyerId: 1, createdAt: -1 });
orderSchema.index({ sellerId: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);

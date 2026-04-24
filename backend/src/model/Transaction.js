const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    amount: { type: Number, required: true },
    /** 7 hoặc 30 — số ngày gia hạn VIP (webhook tính hạn từ gói đã trả) */
    vipPlanDays: { type: Number, default: 30 },
    orderCode: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "CANCELLED"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);

transactionSchema.index({ orderCode: 1 }, { unique: true });
transactionSchema.index({ status: 1 });
/** Tối ưu lọc webhook { orderCode, status: PENDING } khi tải cao */
transactionSchema.index({ orderCode: 1, status: 1 });
/** Truy vấn xác nhận VIP: lọc theo user + order cùng lúc (orderCode vẫn unique global) */
transactionSchema.index({ userId: 1, orderCode: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);

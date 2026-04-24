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

module.exports = mongoose.model("Transaction", transactionSchema);

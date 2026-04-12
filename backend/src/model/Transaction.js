const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["VNPAY", "MOMO", "WALLET"],
      required: true,
    },
    providerTransactionId: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    gatewayResponse: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

transactionSchema.index({ orderId: 1 });
transactionSchema.index({ providerTransactionId: 1 }, { unique: true });

module.exports = mongoose.model("Transaction", transactionSchema);

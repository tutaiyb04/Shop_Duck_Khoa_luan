const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const withdrawalSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },

    // Thông tin ngân hàng nhận tiền
    bankInfo: {
      bankName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      accountName: { type: String, required: true },
    },

    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "APPROVED", "FAILED", "REJECTED"],
      default: "PENDING",
    },

    // 2. CÁC TRƯỜNG KỸ THUẬT QUAN TRỌNG ĐỂ ĐỐI SOÁT
    // Mã giao dịch sinh ra từ hệ thống của bạn (Idempotency Key)
    referenceId: { type: String, required: true, unique: true },

    // Mã giao dịch trả về từ đối tác (VD: Mã giao dịch của MoMo)
    providerTransactionId: { type: String, default: null },

    // Lưu lại toàn bộ log JSON đối tác trả về qua Webhook để dễ debug khi có lỗi
    gatewayResponse: { type: Schema.Types.Mixed },

    adminNote: { type: String, default: "" }, // Lý do nếu từ chối hoặc ghi chú giao dịch
    processedAt: { type: Date }, // Thời điểm Admin phê duyệt/từ chối
  },
  { timestamps: true },
);

// Tối ưu hóa: Lấy lịch sử rút tiền của 1 user nhanh hơn
withdrawalSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Withdrawal", withdrawalSchema);

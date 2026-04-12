const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportSchema = new Schema(
  {
    // Người gửi báo cáo
    reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // Bổ sung kỹ thuật Polymorphic (Đa hình): Báo cáo cái gì?
    targetType: {
      type: String,
      enum: ["PRODUCT", "USER", "MESSAGE", "REVIEW"],
      required: true,
    },
    // ID của thực thể bị báo cáo (Dựa vào targetType ở trên)
    targetId: { type: Schema.Types.ObjectId, required: true },
    // Phân loại lý do để Admin dễ dàng lọc và xử lý tự động
    reason: {
      type: String,
      enum: [
        "Hàng giả / Hàng nhái",
        "Lừa đảo chiếm đoạt",
        "Ngôn từ đả kích / Phản cảm",
        "Spam / Quảng cáo",
        "Sai danh mục",
        "Khác",
      ],
      required: true,
    },
    description: { type: String, required: true },
    // Bằng chứng vi phạm (Ảnh chụp màn hình, ảnh sản phẩm lỗi đẩy lên Cloudinary)
    evidenceImages: [{ type: String }],
    // Trạng thái xử lý của Admin
    status: {
      type: String,
      enum: ["PENDING", "RESOLVED", "REJECTED"],
      default: "PENDING",
    },
    // Ghi chú của Admin sau khi xử lý (Ví dụ: "Đã khóa tài khoản người bán")
    adminNote: { type: String, default: "" },
  },
  { timestamps: true },
);

// Tối ưu hóa truy vấn:
// 1. Giúp Admin load danh sách các báo cáo đang chờ xử lý (PENDING) cực nhanh
reportSchema.index({ status: 1, createdAt: -1 });

// 2. Giúp hệ thống đếm nhanh: "Sản phẩm A đang có bao nhiêu người báo cáo?"
reportSchema.index({ targetId: 1, targetType: 1 });

module.exports = mongoose.model("Report", reportSchema);

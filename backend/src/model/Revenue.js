const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const revenueSchema = new Schema(
  {
    // Lưu theo ngày với định dạng chuỗi YYYY-MM-DD (VD: "2026-04-11")
    // Giúp dễ dàng gom nhóm theo tháng/năm khi vẽ biểu đồ
    date: { type: String, required: true, unique: true },
    // 1. GMV (Gross Merchandise Volume) - Tổng dòng tiền lưu chuyển qua VNPay
    totalGmv: { type: Number, default: 0 },
    // 2. Doanh thu thực tế của sàn (Ví dụ: thu phí 2% mỗi đơn thành công)
    platformFee: { type: Number, default: 0 },
    // 3. Thống kê số lượng đơn hàng trong ngày
    totalOrders: { type: Number, default: 0 }, // Tổng đơn khởi tạo
    successfulOrders: { type: Number, default: 0 }, // Tổng đơn giao thành công
    cancelledOrders: { type: Number, default: 0 }, // Tổng đơn bị hủy/bom hàng
  },
  { timestamps: true },
);

// TỐI ƯU HÓA:
// Đánh Index cho trường 'date' để Admin lọc biểu đồ từ Ngày A đến Ngày B cực kỳ nhanh
revenueSchema.index({ date: 1 });

module.exports = mongoose.model("Revenue", revenueSchema);

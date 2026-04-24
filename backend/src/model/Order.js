const mongoose = require("mongoose");

/**
 * Đơn mua bán 1–1: người mua ↔ người bán ↔ sản phẩm.
 * (Khác với `Transaction` = giao dịch PayOS thanh toán gói VIP sản phẩm.)
 */
const orderSchema = new mongoose.Schema(
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
    /** Số lượng tại thời điểm đặt (thường 1) */
    quantity: { type: Number, default: 1, min: 1 },
    /** Giá snapshot (VND) — khớp Product.price tại thời điểm tạo đơn */
    unitPrice: { type: Number, required: true, min: 0 },
    /** Tổng tiền = unitPrice * quantity (snapshot) */
    totalAmount: { type: Number, required: true, min: 0 },
    /**
     * COD: giao hàng thu tiền | MEETUP: gặp trao đổi trực tiếp
     * VNPAY/MOMO: mở rộng sau
     */
    paymentMethod: {
      type: String,
      enum: ["COD", "MEETUP", "VNPAY", "MOMO"],
      default: "COD",
    },
    /** Địa chỉ giao hàng / điểm hẹn (có thể rỗng nếu thống nhất sau) */
    shippingAddress: { type: String, default: "" },
    trackingCode: { type: String, default: "" },
    /** Ghi chú người mua / bán (không bắt buộc) */
    buyerNote: { type: String, default: "" },
    sellerNote: { type: String, default: "" },
    /**
     * PENDING → đang xử lý; PAID (nếu thanh toán online);
     * SHIPPING → đang giao / đang hẹn; COMPLETED → hoàn tất (mới cho phép review);
     * CANCELLED → hủy
     */
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
orderSchema.index({ productId: 1, status: 1 });
orderSchema.index({ buyerId: 1, productId: 1, status: 1 });

module.exports = mongoose.model("Order", orderSchema);

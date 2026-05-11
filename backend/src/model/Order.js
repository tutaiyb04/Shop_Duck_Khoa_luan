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
    // Số lượng tại thời điểm đặt (thường 1) 
    quantity: { type: Number, default: 1, min: 1 },
    //  Giá snapshot (VND) — khớp Product.price tại thời điểm tạo đơn 
    unitPrice: { type: Number, required: true, min: 0 },
    //  Tổng tiền = unitPrice * quantity (snapshot) 
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED"],
      default: "PENDING",
    },
    // Hội thoại chat dẫn tới giao dịch (nếu có)
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      default: null,
    },
  },
  { timestamps: true },
);

orderSchema.index({ buyerId: 1, createdAt: -1 });
orderSchema.index({ sellerId: 1, createdAt: -1 });
orderSchema.index({ productId: 1, status: 1 });
orderSchema.index({ buyerId: 1, productId: 1, status: 1 });
orderSchema.index({ buyerId: 1, status: 1, productId: 1 });
// Nếu DB còn chỉ mục unique cũ (một tin chỉ một đơn), server sẽ tự gỡ lúc khởi động
// (xem utils/ensureOrderIndexes.js). Hoặc xóa tay: db.orders.dropIndex("productId_1")

module.exports = mongoose.model("Order", orderSchema);

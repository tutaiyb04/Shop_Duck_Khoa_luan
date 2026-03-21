// model/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    condition: { type: String, required: true }, // Mới / Cũ
    description: { type: String, required: true },
    shippingInfo: { type: String, required: true },
    
    // Mảng chứa các link ảnh trả về từ Cloudinary
    images: [{ type: String, required: true }],
    
    // Tham chiếu đến người bán (bắt buộc)
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // Trạng thái hiển thị của sản phẩm (ví dụ: đang bán, đã bán, bị khóa)
    status: { type: String, default: "active", enum: ["active", "sold", "hidden"] }
  },
  { timestamps: true } // Tự động tạo createdAt, updatedAt
);

module.exports = mongoose.model("Product", productSchema);
// model/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Catergory",
      required: true,
    },
    price: { type: Number, required: true },
    condition: {
      type: String,
      required: true,
      enum: ["Mới", "Như mới", "Tốt", "Trung bình", "Kém"],
    },
    description: { type: String, required: true },
    shippingInfo: {
      type: String,
      required: true,
      enum: ["Giao hàng toàn quốc", "Giao dịch trực tiếp", "Thỏa thuận"],
    },
    images: [{ type: String, required: true }],
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "PENDING"],
      default: "AVAILABLE",
    },
  },
  { timestamps: true }, // Tự động tạo createdAt, updatedAt
);

module.exports = mongoose.model("Product", productSchema);

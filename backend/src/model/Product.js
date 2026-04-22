// model/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: { type: Number, required: true },
    condition: {
      type: String,
      required: true,
      enum: ["Mới", "Như mới", "Tốt", "Trung bình", "Kém"],
    },
    quantity: { type: Number, default: 1 },
    description: { type: String, required: true },
    images: [{ type: String, required: true }],
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "AVAILABLE", "REJECTED", "LOCKED", "SOLD", "HIDDEN"],
      default: "PENDING",
    },
    adminNote: String,
    attributes: {
      type: Map,
      of: String,
    },
    address: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // Định dạng bắt buộc: [Kinh độ (Longitude), Vĩ độ (Latitude)]
      },
    },
  },
  { timestamps: true },
);

// Đánh chỉ mục (Index) 2dsphere cho trường location để tối ưu tốc độ tìm kiếm quanh đây
productSchema.index({ location: "2dsphere" });

productSchema.index({ sellerId: 1 }); // Load trang cá nhân của người bán nhanh hơn

module.exports = mongoose.model("Product", productSchema);

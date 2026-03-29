// model/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    condition: { type: String, required: true },
    description: { type: String, required: true },
    shippingInfo: { type: String, required: true },
    images: [{ type: String, required: true }],
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      default: "active",
      enum: ["active", "sold", "hidden"],
    },
  },
  { timestamps: true }, // Tự động tạo createdAt, updatedAt
);

module.exports = mongoose.model("Product", productSchema);

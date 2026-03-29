const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  buyerId: { type: Schema.Types.ObjectId, ref: "User" },
  sellerId: { type: Schema.Types.ObjectId, ref: "User" },
  productId: { type: Schema.Types.ObjectId, ref: "Product" },
  status: { type: String, default: "COMPLETED" },
});

module.exports = mongoose.model("Order", orderSchema);

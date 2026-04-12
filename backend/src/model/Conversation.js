const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conversationSchema = new Schema(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    lastMessage: { type: String, default: "" },
    unreadCount: { type: Map, of: Number, default: {} },
  },
  { timestamps: true },
);

conversationSchema.index({ participants: 1, productId: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);

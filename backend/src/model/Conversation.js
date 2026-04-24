const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conversationSchema = new Schema(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    lastMessage: { type: String, default: "" },
    lastMessageSenderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    unreadCount: { type: Map, of: Number, default: {} },
  },
  { timestamps: true },
);

conversationSchema.index({ participants: 1, productId: 1 });
/** Danh sách hội thoại theo user + sort updatedAt (tải cao). */
conversationSchema.index({ participants: 1, updatedAt: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);

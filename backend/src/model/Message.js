const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    /** Rỗng được phép khi tin chỉ có ảnh; quy tắc “có chữ hoặc ảnh” kiểm tra ở chatService. */
    text: { type: String, default: "" },
    images: [{ type: String }],
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);

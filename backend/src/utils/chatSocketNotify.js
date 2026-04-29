const Conversation = require("../model/Conversation");
const { getIO } = require("./ioRegistry");

// tên sự kiện đồng bộ với frontend `useChatInbox`
const CHAT_CONVERSATION_UPDATED_EVENT = "chat:conversation_updated";

// sự kiện báo hội thoại bị đóng băng do sản phẩm chuyển trạng thái
const CHAT_PRODUCT_LOCKED_EVENT = "chat:product_locked";

// Báo cho mọi participant: danh sách hội thoại / badge cần đồng bộ (realtime)
async function notifyConversationUpdated(conversationId) {
  const io = getIO();
  if (!io || !conversationId) return;
  const conv = await Conversation.findById(conversationId)
    .select("participants")
    .lean();
  if (!conv?.participants?.length) return;
  const payload = { conversationId: String(conversationId) };
  for (const p of conv.participants) {
    io.to(`user:${String(p)}`).emit(CHAT_CONVERSATION_UPDATED_EVENT, payload);
  }
}

// Báo cho mọi participant của tất cả hội thoại thuộc productId rằng khung chat đã bị đóng băng (do sản phẩm Đã bán / bị ẩn / bị khóa)
async function notifyProductChatLocked(productId, productStatus = "SOLD") {
  const io = getIO();

  // kiểm tra io và productId
  if (!io || !productId) {
    return;
  }

  // tìm tất cả hội thoại thuộc productId
  const convs = await Conversation.find({ productId })
    .select("participants")
    .lean();

  // kiểm tra convs có tồn tại không
  if (!convs.length) {
    return;
  }

  for (const conv of convs) {
    const payload = {
      conversationId: String(conv._id),
      productId: String(productId),
      productStatus,
      isFrozen: true,
    };

    for (const p of conv.participants || []) {
      const room = `user:${String(p)}`;
      io.to(room).emit(CHAT_PRODUCT_LOCKED_EVENT, payload);
      io.to(room).emit(CHAT_CONVERSATION_UPDATED_EVENT, {
        conversationId: payload.conversationId,
      });
    }
  }
}

module.exports = {
  notifyConversationUpdated,
  notifyProductChatLocked,
  CHAT_CONVERSATION_UPDATED_EVENT,
  CHAT_PRODUCT_LOCKED_EVENT,
};

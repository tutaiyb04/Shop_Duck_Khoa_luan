const Conversation = require("../model/Conversation");
const { getIO } = require("./ioRegistry");

/** Tên sự kiện — đồng bộ với frontend `useChatInbox`. */
const CHAT_CONVERSATION_UPDATED_EVENT = "chat:conversation_updated";

/**
 * Báo cho mọi participant: danh sách hội thoại / badge cần đồng bộ (realtime).
 */
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

module.exports = {
  notifyConversationUpdated,
  CHAT_CONVERSATION_UPDATED_EVENT,
};

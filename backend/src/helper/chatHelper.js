const MAX_MESSAGE_LENGTH = 5000;
const MAX_IMAGE_URLS = 5;
const MAX_URL_LENGTH = 2000;
// Giới hạn số hội thoại trả về mỗi user
const LIST_CONVERSATIONS_CAP = 200;
// Số ứng viên tối đa khi người bán chọn "bán cho ai" (lọc theo đã chat).
const SALE_CANDIDATES_CAP = 50;
const MESSAGE_CAP = 500;

// các trạng thái khiến sản phẩm bị đóng băng
const FROZEN_PRODUCT_STATUSES = new Set([
  "SOLD",
  "HIDDEN",
  "LOCKED",
  "REJECTED",
]);

// tạo lỗi khi sản phẩm bị đóng băng
function buildFrozenChatError(productStatus) {
  let message = "Hội thoại đã bị khóa, không thể gửi tin nhắn.";

  if (productStatus === "SOLD") {
    message = "Sản phẩm đã được đánh dấu Đã bán — hội thoại bị đóng băng.";
  } else if (productStatus === "HIDDEN") {
    message = "Sản phẩm đã bị ẩn — không thể gửi tin nhắn.";
  } else if (productStatus === "LOCKED") {
    message =
      "Sản phẩm đang bị khóa bởi quản trị viên — không thể gửi tin nhắn.";
  } else if (productStatus === "REJECTED") {
    message = "Sản phẩm đã bị từ chối — không thể gửi tin nhắn.";
  }

  const err = new Error(message);
  err.status = 403;
  err.code = "CHAT_FROZEN";
  err.productStatus = productStatus || null;
  return err;
}

// chuỗi hiển thị trong danh sách hội thoại (text rút gọn hoặc placeholder ảnh)
function lastMessagePreviewForList(text, images) {
  const t = (text && String(text).trim()) || "";
  const nImg = Array.isArray(images) ? images.filter(Boolean).length : 0;
  if (t) {
    return t.length > 200 ? `${t.slice(0, 197)}...` : t;
  }
  if (nImg > 0) {
    return nImg === 1 ? "[Ảnh]" : `[${nImg} ảnh]`;
  }
  return "";
}

// kiểm tra xem userId có phải là participant của conversation không
function isParticipant(conversation, userId) {
  const uid = String(userId);
  return conversation.participants.some((p) => String(p) === uid);
}

// đảm bảo conv.unreadCount là Map (mongoose có thể trả object thường)
function normalizeUnreadCountOnConv(conv) {
  if (!conv.unreadCount) {
    conv.set("unreadCount", new Map());
  } else if (!(conv.unreadCount instanceof Map)) {
    const o =
      conv.unreadCount && typeof conv.unreadCount === "object"
        ? { ...conv.unreadCount }
        : {};
    conv.set("unreadCount", new Map(Object.entries(o)));
  }
}

function getUnreadForUser(conversation, userId) {
  const uid = String(userId);
  const m = conversation.unreadCount;
  if (!m) return 0;
  if (m instanceof Map) {
    return m.get(uid) ?? m.get(userId) ?? 0;
  }
  return m[uid] ?? m[userId] ?? 0;
}

module.exports = {
  MAX_MESSAGE_LENGTH,
  MAX_IMAGE_URLS,
  MAX_URL_LENGTH,
  LIST_CONVERSATIONS_CAP,
  SALE_CANDIDATES_CAP,
  MESSAGE_CAP,
  FROZEN_PRODUCT_STATUSES,
  buildFrozenChatError,
  lastMessagePreviewForList,
  isParticipant,
  normalizeUnreadCountOnConv,
  getUnreadForUser,
};

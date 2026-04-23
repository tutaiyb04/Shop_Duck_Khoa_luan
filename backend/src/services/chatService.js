const mongoose = require("mongoose");
const Conversation = require("../model/Conversation");
const Message = require("../model/Message");
const Product = require("../model/Product");

const MAX_MESSAGE_LENGTH = 5000;
const MAX_IMAGE_URLS = 5;
const MAX_URL_LENGTH = 2000;

function isParticipant(conversation, userId) {
  const uid = String(userId);
  return conversation.participants.some((p) => String(p) === uid);
}

/**
 * Tìm hội thoại buyer–seller theo sản phẩm, hoặc tạo mới.
 */
exports.openOrGetConversation = async (buyerId, productId) => {
  if (!productId || !mongoose.isValidObjectId(String(productId))) {
    const err = new Error("ID sản phẩm không hợp lệ");
    err.status = 400;
    throw err;
  }
  if (!buyerId || !mongoose.isValidObjectId(String(buyerId))) {
    const err = new Error("ID người mua không hợp lệ");
    err.status = 400;
    throw err;
  }

  const product = await Product.findById(productId).select("sellerId name").lean();
  if (!product) {
    const err = new Error("Sản phẩm không tồn tại");
    err.status = 404;
    throw err;
  }

  const sellerId = product.sellerId;
  if (String(sellerId) === String(buyerId)) {
    const err = new Error("Bạn là người bán sản phẩm này, không thể chat với chính mình");
    err.status = 400;
    throw err;
  }

  const b = new mongoose.Types.ObjectId(buyerId);
  const s = new mongoose.Types.ObjectId(sellerId);
  const pid = new mongoose.Types.ObjectId(productId);

  let conv = await Conversation.findOne({
    productId: pid,
    participants: { $all: [b, s] },
  });

  if (!conv) {
    conv = await Conversation.create({
      participants: [b, s],
      productId: pid,
      lastMessage: "",
    });
  }

  return {
    conversation: {
      id: String(conv._id),
      productId: String(conv.productId),
    },
  };
};

function getUnreadForUser(conversation, userId) {
  const uid = String(userId);
  const m = conversation.unreadCount;
  if (!m) return 0;
  if (m instanceof Map) {
    return m.get(uid) ?? m.get(userId) ?? 0;
  }
  return m[uid] ?? m[userId] ?? 0;
}

/**
 * Danh sách hội thoại của user, mới nhất trước.
 */
exports.listConversations = async (userId) => {
  if (!userId || !mongoose.isValidObjectId(String(userId))) {
    const err = new Error("ID người dùng không hợp lệ");
    err.status = 400;
    throw err;
  }
  const uid = new mongoose.Types.ObjectId(String(userId));
  const rows = await Conversation.find({ participants: uid })
    .sort({ updatedAt: -1 })
    .populate("productId", "name images price")
    .populate("participants", "username avatar")
    .lean();

  return rows.map((c) => {
    const me = String(userId);
    const other = (c.participants || []).find((p) => String(p._id) !== me);
    const product = c.productId;
    return {
      id: String(c._id),
      product: product
        ? {
            id: String(product._id),
            name: product.name,
            images: product.images || [],
            price: product.price,
          }
        : null,
      otherParticipant: other
        ? {
            id: String(other._id),
            username: other.username,
            avatar: other.avatar,
          }
        : null,
      lastMessage: c.lastMessage || "",
      unreadForMe: getUnreadForUser(c, userId),
      updatedAt: c.updatedAt,
    };
  });
};

const MESSAGE_CAP = 500;

/**
 * Lịch sử tin nhắn một cuộc hội thoại (user phải là participants).
 */
exports.getMessages = async (conversationId, userId) => {
  if (!mongoose.isValidObjectId(conversationId)) {
    const err = new Error("ID hội thoại không hợp lệ");
    err.status = 400;
    throw err;
  }

  const conv = await Conversation.findById(conversationId);
  if (!conv) {
    const err = new Error("Không tìm thấy hội thoại");
    err.status = 404;
    throw err;
  }
  if (!isParticipant(conv, userId)) {
    const err = new Error("Bạn không tham gia hội thoại này");
    err.status = 403;
    throw err;
  }

  const messages = await Message.find({ conversationId: conv._id })
    .sort({ createdAt: 1 })
    .limit(MESSAGE_CAP)
    .populate("senderId", "username avatar")
    .lean();

  return {
    conversation: {
      id: String(conv._id),
      productId: String(conv.productId),
      participants: conv.participants.map((p) => String(p)),
    },
    messages: messages.map((m) => {
      const s = m.senderId;
      const sender =
        s && typeof s === "object" && s.username != null
          ? {
              id: String(s._id),
              username: s.username,
              avatar: s.avatar,
            }
          : {
              id: String(s),
              username: "?",
              avatar: null,
            };
      return {
        id: String(m._id),
        text: m.text,
        images: m.images || [],
        isRead: m.isRead,
        createdAt: m.createdAt,
        sender,
      };
    }),
  };
};

/**
 * Tạo tin nhắn, cập nhật lastMessage + unreadCount + updatedAt trên Conversation.
 */
exports.sendMessage = async (userId, { conversationId, text, images = [] }) => {
  if (!mongoose.isValidObjectId(conversationId)) {
    const err = new Error("ID hội thoại không hợp lệ");
    err.status = 400;
    throw err;
  }
  const body = (text && String(text).trim()) || "";
  if (!body) {
    const err = new Error("Nội dung tin nhắn không được để trống");
    err.status = 400;
    throw err;
  }
  if (body.length > MAX_MESSAGE_LENGTH) {
    const err = new Error(`Nội dung tối đa ${MAX_MESSAGE_LENGTH} ký tự`);
    err.status = 400;
    throw err;
  }

  let imageUrls = Array.isArray(images) ? images : [];
  if (imageUrls.length > MAX_IMAGE_URLS) {
    const err = new Error(`Tối đa ${MAX_IMAGE_URLS} ảnh đính kèm`);
    err.status = 400;
    throw err;
  }
  imageUrls = imageUrls
    .map((s) => String(s).trim())
    .filter(Boolean)
    .map((s) => (s.length > MAX_URL_LENGTH ? s.slice(0, MAX_URL_LENGTH) : s));

  const conv = await Conversation.findById(conversationId);
  if (!conv) {
    const err = new Error("Không tìm thấy hội thoại");
    err.status = 404;
    throw err;
  }
  if (!isParticipant(conv, userId)) {
    const err = new Error("Bạn không tham gia hội thoại này");
    err.status = 403;
    throw err;
  }

  const message = await Message.create({
    conversationId: conv._id,
    senderId: userId,
    text: body,
    images: imageUrls,
  });

  if (!conv.unreadCount) {
    conv.set("unreadCount", new Map());
  } else if (!(conv.unreadCount instanceof Map)) {
    const o =
      conv.unreadCount && typeof conv.unreadCount === "object"
        ? { ...conv.unreadCount }
        : {};
    conv.set("unreadCount", new Map(Object.entries(o)));
  }

  conv.lastMessage = body.length > 200 ? `${body.slice(0, 197)}...` : body;
  for (const p of conv.participants) {
    if (String(p) === String(userId)) {
      continue;
    }
    const k = String(p);
    const cur = conv.unreadCount.get(k) ?? 0;
    conv.unreadCount.set(k, cur + 1);
  }
  conv.markModified("unreadCount");
  await conv.save();

  await message.populate("senderId", "username avatar");

  const pop = message.senderId;
  const sender =
    pop && typeof pop === "object" && pop._id
      ? {
          id: String(pop._id),
          username: pop.username,
          avatar: pop.avatar,
        }
      : {
          id: String(userId),
          username: "?",
          avatar: null,
        };

  return {
    id: String(message._id),
    text: message.text,
    images: message.images,
    isRead: message.isRead,
    createdAt: message.createdAt,
    conversationId: String(conv._id),
    sender,
  };
};

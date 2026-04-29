const mongoose = require("mongoose");
const Conversation = require("../model/Conversation");
const Message = require("../model/Message");
const Product = require("../model/Product");
const User = require("../model/User");

const {
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
} = require("../helper/chatHelper");

exports.FROZEN_PRODUCT_STATUSES = FROZEN_PRODUCT_STATUSES;

// tìm hội thoại buyer–seller theo sản phẩm, hoặc tạo mới
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

  const product = await Product.findById(productId)
    .select("sellerId name status")
    .lean();
  if (!product) {
    const err = new Error("Sản phẩm không tồn tại");
    err.status = 404;
    throw err;
  }

  const sellerId = product.sellerId;
  if (String(sellerId) === String(buyerId)) {
    const err = new Error(
      "Bạn là người bán sản phẩm này, không thể chat với chính mình",
    );
    err.status = 400;
    throw err;
  }

  const b = new mongoose.Types.ObjectId(buyerId);
  const s = new mongoose.Types.ObjectId(sellerId);
  const pid = new mongoose.Types.ObjectId(String(productId));

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
      productStatus: product.status || null,
      isFrozen: FROZEN_PRODUCT_STATUSES.has(product.status),
    },
  };
};

// danh sách người mua có thể bán cho sản phẩm
exports.listChatBuyersForProduct = async (sellerId, productId) => {
  if (!productId || !mongoose.isValidObjectId(String(productId))) {
    const err = new Error("ID sản phẩm không hợp lệ");
    err.status = 400;
    throw err;
  }

  if (!sellerId || !mongoose.isValidObjectId(String(sellerId))) {
    const err = new Error("ID người bán không hợp lệ");
    err.status = 400;
    throw err;
  }

  const product = await Product.findById(productId).select("sellerId").lean();

  if (!product) {
    const err = new Error("Sản phẩm không tồn tại");
    err.status = 404;
    throw err;
  }

  if (String(product.sellerId) !== String(sellerId)) {
    const err = new Error("Bạn không phải người bán sản phẩm này");
    err.status = 403;
    throw err;
  }

  const sId = new mongoose.Types.ObjectId(String(sellerId));

  const pId = new mongoose.Types.ObjectId(String(productId));

  // tìm các cuộc hội thoại
  const convs = await Conversation.find({
    productId: pId,
    participants: sId,
  })
    .select("participants")
    .limit(SALE_CANDIDATES_CAP)
    .lean();

  // Lọc ra danh sách Người mua
  const seen = new Set();
  const buyers = [];
  for (const c of convs) {
    for (const p of c.participants || []) {
      const idStr = String(p);

      if (idStr === String(sellerId) || seen.has(idStr)) continue;

      seen.add(idStr);
      buyers.push(new mongoose.Types.ObjectId(idStr));
    }
  }

  if (buyers.length === 0) {
    return { buyers: [] };
  }

  const buyerToConv = new Map();
  for (const c of convs) {
    const other = (c.participants || []).find(
      (p) => String(p) !== String(sellerId),
    );

    if (other) {
      buyerToConv.set(String(other), c._id);
    }
  }

  // tìm thông tin người mua
  const userDocs = await User.find({ _id: { $in: buyers } })
    .select("username avatar")
    .lean();

  const byId = new Map(userDocs.map((u) => [String(u._id), u]));

  return {
    buyers: buyers.map((bid) => {
      const u = byId.get(String(bid));
      const convId = buyerToConv.get(String(bid));
      return {
        user: {
          _id: bid,
          username: u?.username ?? "?",
          avatar: u?.avatar ?? null,
        },
        conversationId: convId ? String(convId) : null,
      };
    }),
  };
};

// danh sách hội thoại của user, mới nhất trước
exports.listConversations = async (userId) => {
  if (!userId || !mongoose.isValidObjectId(String(userId))) {
    const err = new Error("ID người dùng không hợp lệ");
    err.status = 400;
    throw err;
  }
  const uid = new mongoose.Types.ObjectId(String(userId));
  const uidStr = String(userId);
  const rows = await Conversation.find({
    participants: uid,
    [`userHidden.${uidStr}`]: { $ne: true },
    hiddenFromUsers: { $nin: [uid] },
  })
    .select(
      "participants productId lastMessage lastMessageSenderId unreadCount updatedAt",
    )
    .sort({ updatedAt: -1 })
    .limit(LIST_CONVERSATIONS_CAP)
    .populate("productId", "name images price status")
    .populate("participants", "username avatar")
    .lean();

  return rows.map((c) => {
    const me = String(userId);
    const other = (c.participants || []).find((p) => String(p._id) !== me);
    const product = c.productId;
    const lastSid = c.lastMessageSenderId
      ? String(c.lastMessageSenderId)
      : null;
    const lastSenderDoc =
      lastSid != null
        ? (c.participants || []).find((p) => String(p._id) === lastSid)
        : null;
    const lastMessageSenderUsername =
      lastSenderDoc &&
      typeof lastSenderDoc === "object" &&
      lastSenderDoc.username != null
        ? lastSenderDoc.username
        : null;
    return {
      id: String(c._id),
      product: product
        ? {
            id: String(product._id),
            name: product.name,
            images: product.images || [],
            price: product.price,
            status: product.status || null,
            isFrozen: FROZEN_PRODUCT_STATUSES.has(product.status),
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
      lastMessageSenderId: lastSid,
      lastMessageSenderUsername,
      unreadForMe: getUnreadForUser(c, userId),
      updatedAt: c.updatedAt,
    };
  });
};

// lịch sử tin nhắn một cuộc hội thoại (user phải là participants)
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

  const uidKey = String(userId);
  await Conversation.updateOne(
    { _id: conv._id },
    { $unset: { [`userHidden.${uidKey}`]: "" } },
  );
  await Conversation.updateOne(
    { _id: conv._id },
    { $set: { [`unreadCount.${uidKey}`]: 0 } },
  );

  const messages = await Message.find({ conversationId: conv._id })
    .select("text images isRead createdAt senderId")
    .sort({ createdAt: 1 })
    .limit(MESSAGE_CAP)
    .populate("senderId", "username avatar")
    .lean();

  const product = await Product.findById(conv.productId)
    .select("status name images price")
    .lean();
  const productStatus = product?.status || null;

  return {
    conversation: {
      id: String(conv._id),
      productId: String(conv.productId),
      participants: conv.participants.map((p) => String(p)),
      productStatus,
      isFrozen: FROZEN_PRODUCT_STATUSES.has(productStatus),
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

// gửi tin nhắn
exports.sendMessage = async (userId, { conversationId, text, images = [] }) => {
  if (!mongoose.isValidObjectId(conversationId)) {
    const err = new Error("ID hội thoại không hợp lệ");
    err.status = 400;
    throw err;
  }

  const body = text != null ? String(text).trim() : "";

  let imageUrls = Array.isArray(images) ? images : [];

  imageUrls = imageUrls
    .map((s) => String(s).trim())
    .filter(Boolean)
    .map((s) => (s.length > MAX_URL_LENGTH ? s.slice(0, MAX_URL_LENGTH) : s));

  if (!body && imageUrls.length === 0) {
    const err = new Error("Nhập nội dung hoặc đính kèm ít nhất một ảnh");
    err.status = 400;
    throw err;
  }

  if (body.length > MAX_MESSAGE_LENGTH) {
    const err = new Error(`Nội dung tối đa ${MAX_MESSAGE_LENGTH} ký tự`);
    err.status = 400;
    throw err;
  }

  if (imageUrls.length > MAX_IMAGE_URLS) {
    const err = new Error(`Tối đa ${MAX_IMAGE_URLS} ảnh đính kèm`);
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

  // khóa hội thoại theo trạng thái sản phẩm
  const product = await Product.findById(conv.productId)
    .select("status")
    .lean();

  if (!product) {
    const err = new Error("Sản phẩm gốc của hội thoại không còn tồn tại");
    err.status = 404;
    throw err;
  }

  if (FROZEN_PRODUCT_STATUSES.has(product.status)) {
    throw buildFrozenChatError(product.status);
  }

  const message = await Message.create({
    conversationId: conv._id,
    senderId: userId,
    text: body || "",
    images: imageUrls,
  });

  normalizeUnreadCountOnConv(conv);

  conv.lastMessage = lastMessagePreviewForList(body, imageUrls);
  conv.lastMessageSenderId = userId;
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

  const recipientIds = conv.participants.filter(
    (p) => String(p) !== String(userId),
  );
  if (recipientIds.length > 0) {
    const $unset = {};
    for (const p of recipientIds) {
      $unset[`userHidden.${String(p)}`] = "";
    }
    await Conversation.updateOne({ _id: conv._id }, { $unset });
  }

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

// xóa mềm: ẩn hội thoại khỏi danh sách của user hiện tại (không xóa tin nhắn)
exports.softHideConversationForUser = async (userId, conversationId) => {
  if (!mongoose.isValidObjectId(conversationId)) {
    const err = new Error("ID hội thoại không hợp lệ");
    err.status = 400;
    throw err;
  }
  const uid = new mongoose.Types.ObjectId(String(userId));
  const exists = await Conversation.findOne({
    _id: conversationId,
    participants: uid,
  })
    .select("_id")
    .lean();
  if (!exists) {
    const err = new Error("Không tìm thấy hội thoại hoặc bạn không tham gia");
    err.status = 404;
    throw err;
  }
  await Conversation.updateOne(
    { _id: new mongoose.Types.ObjectId(String(conversationId)) },
    { $set: { [`userHidden.${String(userId)}`]: true } },
  );
  return { ok: true };
};

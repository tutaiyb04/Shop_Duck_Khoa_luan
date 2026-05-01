const mongoose = require("mongoose");
const Notification = require("../model/Notification");
const { getIO } = require("../utils/ioRegistry");

const EVT_NEW = "notification:new"; // có 1 thông báo mới
const EVT_UPDATED = "notification:updated"; // bản cũ được cộng dồn (group)
const EVT_READ = "notification:read"; // đánh dấu đã đọc
const EVT_DELETED = "notification:deleted"; // bị xoá
const EVT_UNREAD_COUNT = "notification:unread_count"; // badge số chưa đọc

const TYPES = Notification.TYPES; // danh sách các loại thông báo
const REF_MODELS = Notification.REF_MODELS; // danh sách các model liên quan

// Số actor preview tối đa giữ trong metadata.lastActorIds (vd: "A, B và 8 người khác")
const MAX_ACTOR_PREVIEW = 5;
const MAX_PAGE_SIZE = 50; // số lượng thông báo tối đa trên 1 trang
const DEFAULT_PAGE_SIZE = 15;

// đảm bảo dữ liệu truyền vào luôn là 1 ObjectId hợp lệ của mongoDB
const ensureObjectId = (val, label) => {
  if (!val || !mongoose.isValidObjectId(String(val))) {
    const err = new Error(`${label} không hợp lệ`);
    err.status = 400;
    throw err;
  }

  return new mongoose.Types.ObjectId(String(val));
};

// biến đổi dữ liệu gốc (document) thành 1 object javascript thuần thúy cho FE
const toClient = (doc) => {
  if (!doc) {
    return null;
  }

  const object = doc.toObject ? doc.toObject() : doc;

  return {
    id: String(object._id),
    userId: object.userId ? String(object.userId) : null,
    actorId: object.actorId ? String(object.actorId) : null,
    type: object.type,
    title: object.title,
    content: object.content,
    relatedId: object.relatedId ? String(object.relatedId) : null,
    refModel: object.refModel || null,
    groupKey: object.groupKey || null,
    metadata: object.metadata || {},
    isRead: !!object.isRead,
    readAt: object.readAt || null,
    createdAt: object.createdAt,
    updatedAt: object.updatedAt,
  };
};

// gửi thông báo đến đích danh 1 user qua socket.io
const emitToUser = (userId, event, payload) => {
  const io = getIO();

  if (!io || !userId) {
    return;
  }

  io.to(`user:${String(userId)}`).emit(event, payload);
};

// đếm số lượng thông báo chưa đọc của 1 user rồi đẩy về client qua socket
const emitUnreadCount = async (userId) => {
  try {
    const uid = ensureObjectId(userId, "userId");

    const count = await Notification.countDocuments({
      userId: uid,
      isRead: false,
    });

    emitToUser(uid, EVT_UNREAD_COUNT, { count });
  } catch (e) {
    console.error("[notification] emitUnreadCount lỗi:", e.message);
  }
};

// lấy id user từ req (đã được set bởi middleware protect)
const userIdOf = (req) => {
  return req.user?._id || req.user?.id;
};

// chuẩn hoá phản hồi lỗi: ưu tiên error.status từ service, mặc định 500
const sendError = (res, error, fallbackMessage, logTag) => {
  if (error?.status) {
    return res.status(error.status).json({ message: error.message });
  }

  console.error(`Lỗi ${logTag}:`, error);
  return res
    .status(500)
    .json({ message: error?.message || fallbackMessage });
};

module.exports = {
  // socket events
  EVT_NEW,
  EVT_UPDATED,
  EVT_READ,
  EVT_DELETED,
  EVT_UNREAD_COUNT,
  // enums lấy từ model
  TYPES,
  REF_MODELS,
  // hằng số
  MAX_ACTOR_PREVIEW,
  MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
  // helpers cho service (DB / socket)
  ensureObjectId,
  toClient,
  emitToUser,
  emitUnreadCount,
  // helpers cho controller (HTTP layer)
  userIdOf,
  sendError,
};

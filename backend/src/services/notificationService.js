const mongoose = require("mongoose");
const Notification = require("../model/Notification");
const {
  EVT_NEW,
  EVT_UPDATED,
  EVT_READ,
  EVT_DELETED,
  EVT_UNREAD_COUNT,
  TYPES,
  REF_MODELS,
  MAX_ACTOR_PREVIEW,
  MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
  ensureObjectId,
  toClient,
  emitToUser,
  emitUnreadCount,
} = require("../helper/notificationHelper");

// tạo 1 thông báo, kiểm duyệt và phát tín hiệu real-time
exports.createNotification = async (input) => {
  // lấy từng giá trị trong inpu
  const {
    userId,
    actorId = null,
    type,
    title,
    content,
    relatedId = null,
    refModel = null,
    metadata = {},
    groupKey = null,
  } = input || {};

  // kiểm tra loại thông báo 
  if (!type || !TYPES[type]) {
    const err = new Error(`Loại thông báo không hợp lệ: ${type}`);
    err.status = 400;
    throw err;
  }

  // kiểm tra userId và actorId có đúng dạng chuẩn của mongoDB 
  const uid = ensureObjectId(userId, "userId");
  const actorOid = actorId ? ensureObjectId(actorId, "actorId") : null;

  // Không tự gửi thông báo cho chính mình
  if (actorOid && String(actorOid) === String(uid)) {
    return null;
  }

  // kiểm tra ID của sản phẩm, đơn hàng ... có đúng dạng chuẩn của mongoDB 
  const relOid = relatedId ? ensureObjectId(relatedId, "relatedId") : null;

  if (refModel && !REF_MODELS[refModel]) {
    const err = new Error(`refModel không hợp lệ: ${refModel}`);
    err.status = 400;
    throw err;
  }

  const cleanTitle = String(title || "").trim();
  const cleanContent = String(content || "").trim();
  if (!cleanTitle || !cleanContent) {
    const err = new Error("title và content không được để trống");
    err.status = 400;
    throw err;
  }

  // kiểm tra không có groupKey thì tạo mới luôn
  if (!groupKey) {
    const created = await Notification.create({
      userId: uid,
      actorId: actorOid,
      type,
      title: cleanTitle,
      content: cleanContent,
      relatedId: relOid,
      refModel,
      metadata,
    });

    const payload = toClient(created);  // biến đổi payload thành object javascript thuần thúy cho FE

    emitToUser(uid, EVT_NEW, payload); // gửi thông báo đến đích danh 1 user qua socket.io
    emitUnreadCount(uid); // đếm số lượng thông báo chưa đọc của 1 user
    
    return payload;
  }

  // tìm thông báo cùng groupKey và chưa đọc
  const existing = await Notification.findOne({
    userId: uid,
    groupKey,
    isRead: false,
  });

  // nếu không tìm thấy thông báo cùng groupKey và chưa đọc thì tạo mới
  if (!existing) {
    const created = await Notification.create({
      userId: uid,
      actorId: actorOid,
      type,
      title: cleanTitle,
      content: cleanContent,
      relatedId: relOid,
      refModel,
      groupKey,
      metadata: {
        ...metadata,
        likeCount: metadata.likeCount ?? 1,
        lastActorIds: actorOid ? [actorOid] : [],
      },
    });

    const payload = toClient(created);
    
    emitToUser(uid, EVT_NEW, payload);
    emitUnreadCount(uid);
    
    return payload;
  }

  // cập nhật thông báo cũ bằng thông báo mới
  existing.title = cleanTitle;
  existing.content = cleanContent;
  existing.actorId = actorOid || existing.actorId;
  existing.relatedId = relOid || existing.relatedId;
  existing.refModel = refModel || existing.refModel;

  // cộng dồn likeCount và đẩy actor mới lên đầu
  const meta = existing.metadata || {};
  meta.likeCount = (meta.likeCount ?? 1) + 1;

  if (actorOid) {
    const arr = Array.isArray(meta.lastActorIds) ? meta.lastActorIds : [];  // kiểm tra lastActorIds có phải là 1 mảng không

    // kiểm tra trùng lặp
    const filtered = arr.filter((a) => String(a) !== String(actorOid));
    
    filtered.unshift(actorOid); // thêm actorOid vào đầu mảng
    meta.lastActorIds = filtered.slice(0, MAX_ACTOR_PREVIEW);
  }

  // Trộn các key metadata khác (vd: rating mới, reason mới…), trừ field đã xử lý
  for (const k of Object.keys(metadata || {})) {
    if (k === "likeCount" || k === "lastActorIds") continue;
    meta[k] = metadata[k];
  }

  existing.metadata = meta; // cập nhật metadata của thông báo cũ
  existing.markModified("metadata"); // đánh dấu metadata đã bị thay đổi
  await existing.save();

  const payload = toClient(existing);
  emitToUser(uid, EVT_UPDATED, payload);
  return payload;
};

// gửi thông báo đến đích danh 1 user qua socket.io
exports.notifyOrderConfirmed = ({
  buyerId,
  sellerId,
  orderId,
  totalAmount,
}) =>
  exports.createNotification({
    userId: buyerId,
    actorId: sellerId || null,
    type: TYPES.ORDER_CONFIRMED,
    title: "Đơn hàng đã được xác nhận",
    content: "Người bán đã chốt đơn của bạn. Vui lòng kiểm tra chi tiết.",
    relatedId: orderId,
    refModel: REF_MODELS.Order,
    metadata: { totalAmount: Number(totalAmount) || 0 }, // thêm totalAmount vào metadata
  });

exports.notifyReviewReminder = ({ buyerId, orderId, productName }) =>
  exports.createNotification({
    userId: buyerId,
    type: TYPES.REVIEW_REMINDER,
    title: "Đánh giá đơn hàng",
    content: productName
      ? `Hãy đánh giá "${productName}" để giúp người mua khác.`
      : "Hãy đánh giá đơn hàng đã hoàn tất.",
    relatedId: orderId,
    refModel: REF_MODELS.Order,
  });

exports.notifyReviewReceived = ({
  sellerId,
  productId,
  actorId,
  rating,
  comment,
  productName,
}) =>
  exports.createNotification({
    userId: sellerId,
    actorId,
    type: TYPES.REVIEW_RECEIVED,
    title: "Có đánh giá mới",
    content: productName
      ? `Sản phẩm "${productName}" vừa nhận đánh giá ${rating || ""} sao.`
      : `Bạn vừa nhận đánh giá ${rating || ""} sao.`,
    relatedId: productId,
    refModel: REF_MODELS.Product,
    groupKey: productId ? `REVIEW_RECEIVED:${String(productId)}` : null,
    metadata: { rating: Number(rating) || 0, comment: comment || "" },
  });

exports.notifyProductApproved = ({ sellerId, productId, productName }) =>
  exports.createNotification({
    userId: sellerId,
    type: TYPES.PRODUCT_APPROVED,
    title: "Tin đăng đã được duyệt",
    content: productName
      ? `Tin "${productName}" đã hiển thị công khai.`
      : "Tin đăng của bạn đã được duyệt.",
    relatedId: productId,
    refModel: REF_MODELS.Product,
  });

exports.notifyProductRejected = ({
  sellerId,
  productId,
  productName,
  reason,
}) =>
  exports.createNotification({
    userId: sellerId,
    type: TYPES.PRODUCT_REJECTED,
    title: "Tin đăng bị từ chối",
    content: productName
      ? `Tin "${productName}" không đạt điều kiện đăng.`
      : "Tin đăng của bạn không được duyệt.",
    relatedId: productId,
    refModel: REF_MODELS.Product,
    metadata: { reason: reason || "" },
  });

exports.notifyProductHidden = ({
  sellerId,
  productId,
  productName,
  reason,
}) =>
  exports.createNotification({
    userId: sellerId,
    type: TYPES.PRODUCT_HIDDEN,
    title: "Tin đăng bị ẩn",
    content: productName
      ? `Tin "${productName}" đã bị admin ẩn.`
      : "Tin đăng của bạn đã bị ẩn.",
    relatedId: productId,
    refModel: REF_MODELS.Product,
    metadata: { reason: reason || "" },
  });

exports.notifyProductLiked = ({
  sellerId,
  productId,
  productName,
  actorId,
}) =>
  exports.createNotification({
    userId: sellerId,
    actorId,
    type: TYPES.PRODUCT_LIKED,
    title: "Có người thích sản phẩm",
    content: productName
      ? `Sản phẩm "${productName}" vừa có thêm lượt thích.`
      : "Sản phẩm của bạn vừa có thêm lượt thích.",
    relatedId: productId,
    refModel: REF_MODELS.Product,
    groupKey: productId ? `PRODUCT_LIKED:${String(productId)}` : null,
  });

// lấy danh sách thông báo của 1 user
exports.listUserNotifications = async (userId, query = {}) => {
  const uid = ensureObjectId(userId, "userId");
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(query.limit) || DEFAULT_PAGE_SIZE),
  );
  const skip = (page - 1) * limit;

  const filter = { userId: uid }; // lấy thông báo từ đúng user này
  if (query.isRead === "true" || query.isRead === true) filter.isRead = true; // lấy thông báo đã đọc
  if (query.isRead === "false" || query.isRead === false) filter.isRead = false; // lấy thông báo chưa đọc
  if (query.type && TYPES[query.type]) filter.type = query.type; // lấy thông báo theo loại

  // Chạy song song 3 query để giảm độ trễ
  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("actorId", "username avatar") // lấy thông tin người tạo thông báo
      .lean(),
    Notification.countDocuments(filter), // đếm số lượng thông báo
    Notification.countDocuments({ userId: uid, isRead: false }), // đếm số lượng thông báo chưa đọc
  ]);

  // dùng map duyệt qua từng thông báo, làm sạch dữ liệu bằng toClient
  return {
    items: items.map((n) => ({
      ...toClient(n),
      actor:
        n.actorId && typeof n.actorId === "object"
          ? {
              id: String(n.actorId._id),
              username: n.actorId.username,
              avatar: n.actorId.avatar,
            }
          : null,
    })),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
    unreadCount,
  };
};

// đếm số lượng thông báo chưa đọc của 1 user
exports.getUnreadCount = async (userId) => {
  const uid = ensureObjectId(userId, "userId");

  const count = await Notification.countDocuments({ 
    userId: uid,
    isRead: false,
  });

  return { count };
};

// đánh dấu 1 thông báo đã đọc
exports.markAsRead = async (userId, notificationId) => {
  // kiểm tra userId và notificationId có đúng dạng chuẩn của mongoDB
  const uid = ensureObjectId(userId, "userId");
  const nid = ensureObjectId(notificationId, "notificationId");

  const updated = await Notification.findOneAndUpdate(
    { _id: nid, userId: uid, isRead: false }, // kiểm tra thông báo có đúng userId và chưa đọc
    { $set: { isRead: true, readAt: new Date() } }, // đánh dấu thông báo đã đọc
    { returnDocument: "after" },
  );

  // nếu không tìm thấy thông báo thì trả về lỗi
  if (!updated) {
    const exists = await Notification.exists({ _id: nid, userId: uid });
    if (!exists) {
      const err = new Error("Không tìm thấy thông báo");
      err.status = 404;
      throw err;
    }
    return { ok: true, alreadyRead: true };
  }

  // gửi thông báo đã đọc đến đích danh 1 user qua socket.io
  emitToUser(uid, EVT_READ, { id: String(updated._id) });
  emitUnreadCount(uid); // đếm số lượng thông báo chưa đọc của 1 user

  return { 
    ok: true, 
    notification: toClient(updated) 
  };
};

// đánh dấu nhiều thông báo đã đọc
exports.markManyAsRead = async (userId, ids = []) => {
  const uid = ensureObjectId(userId, "userId");

  // kiểm ta các id có đúng dạng chuẩn của mongoDB
  const nids = (Array.isArray(ids) ? ids : [])
    .filter((x) => mongoose.isValidObjectId(String(x)))
    .map((x) => new mongoose.Types.ObjectId(String(x)));

  // nếu sau khi lọc mà không còn id nào, kết thúc và trả về 0 (false)
  if (nids.length === 0) {
    return { 
      ok: true, 
      modifiedCount: 0 
    };
  }

  // cập nhật nhiều thông báo đã đọc
  const r = await Notification.updateMany(
    { _id: { $in: nids }, userId: uid, isRead: false },
    { $set: { isRead: true, readAt: new Date() } },
  );

  emitToUser(uid, EVT_READ, { ids: nids.map((i) => String(i)) });
  emitUnreadCount(uid);

  return { 
    ok: true, 
    modifiedCount: r.modifiedCount || 0 
  };
};

// đánh dấu tất cả thông báo đã đọc
exports.markAllAsRead = async (userId) => {
  const uid = ensureObjectId(userId, "userId");

  const r = await Notification.updateMany(
    { userId: uid, isRead: false },
    { $set: { isRead: true, readAt: new Date() } },
  );

  emitToUser(uid, EVT_READ, { all: true });
  emitToUser(uid, EVT_UNREAD_COUNT, { count: 0 });
  
  return { ok: true, modifiedCount: r.modifiedCount || 0 };
};

// xoá 1 thông báo
exports.deleteNotification = async (userId, notificationId) => {
  const uid = ensureObjectId(userId, "userId");
  const nid = ensureObjectId(notificationId, "notificationId");

  const r = await Notification.findOneAndDelete({ _id: nid, userId: uid });

  if (!r) {
    const err = new Error("Không tìm thấy thông báo");
    err.status = 404;
    throw err;
  }

  emitToUser(uid, EVT_DELETED, { id: String(nid) });
  emitUnreadCount(uid);
  return { ok: true };
};

// xoá tất cả thông báo đã đọc
exports.deleteAllRead = async (userId) => {
  const uid = ensureObjectId(userId, "userId");
  const r = await Notification.deleteMany({ userId: uid, isRead: true });

  emitToUser(uid, EVT_DELETED, { allRead: true });
  
  return { ok: true, deletedCount: r.deletedCount || 0 };
};

// Xuất tên event để frontend / test có thể tham chiếu
exports.SOCKET_EVENTS = {
  EVT_NEW,
  EVT_UPDATED,
  EVT_READ,
  EVT_DELETED,
  EVT_UNREAD_COUNT,
};

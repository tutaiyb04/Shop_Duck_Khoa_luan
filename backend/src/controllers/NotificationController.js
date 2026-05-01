const notificationService = require("../services/notificationService");
const { userIdOf, sendError } = require("../helper/notificationHelper");

// danh sách thông báo của user (có phân trang + filter)
exports.getMyNotifications = async (req, res) => {
  try {
    const uid = userIdOf(req);

    if (!uid) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    // ?page=1 &limit=15 &isRead=true|false &type=PRODUCT_LIKED
    const data = await notificationService.listUserNotifications(uid, req.query);

    return res.json(data);
  } catch (error) {
    return sendError(res, error, "Lỗi lấy danh sách thông báo", "getMyNotifications");
  }
};

// số thông báo chưa đọc cho badge
exports.getUnreadCount = async (req, res) => {
  try {
    const uid = userIdOf(req);

    if (!uid) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const data = await notificationService.getUnreadCount(uid);

    return res.json(data);
  } catch (error) {
    return sendError(res, error, "Lỗi lấy số thông báo chưa đọc", "getUnreadCount");
  }
};

// đánh dấu 1 thông báo đã đọc
exports.markOneAsRead = async (req, res) => {
  try {
    const uid = userIdOf(req);

    if (!uid) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const { id } = req.params;

    const data = await notificationService.markAsRead(uid, id);

    return res.json(data);
  } catch (error) {
    return sendError(res, error, "Lỗi đánh dấu thông báo đã đọc", "markOneAsRead");
  }
};

// đánh dấu nhiều thông báo đã đọc theo danh sách id
exports.markManyAsRead = async (req, res) => {
  try {
    const uid = userIdOf(req);

    if (!uid) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];

    if (ids.length === 0) {
      return res
        .status(400)
        .json({ message: "Danh sách ids không được để trống" });
    }

    const data = await notificationService.markManyAsRead(uid, ids);

    return res.json(data);
  } catch (error) {
    return sendError(res, error, "Lỗi đánh dấu nhiều thông báo đã đọc", "markManyAsRead");
  }
};

// đánh dấu tất cả thông báo đã đọc
exports.markAllAsRead = async (req, res) => {
  try {
    const uid = userIdOf(req);

    if (!uid) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const data = await notificationService.markAllAsRead(uid);

    return res.json(data);
  } catch (error) {
    return sendError(res, error, "Lỗi đánh dấu tất cả đã đọc", "markAllAsRead");
  }
};

// xoá 1 thông báo
exports.deleteOne = async (req, res) => {
  try {
    const uid = userIdOf(req);

    if (!uid) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const { id } = req.params;

    const data = await notificationService.deleteNotification(uid, id);

    return res.json(data);
  } catch (error) {
    return sendError(res, error, "Lỗi xoá thông báo", "deleteOne");
  }
};

// xoá tất cả thông báo đã đọc
exports.deleteAllRead = async (req, res) => {
  try {
    const uid = userIdOf(req);

    if (!uid) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const data = await notificationService.deleteAllRead(uid);

    return res.json(data);
  } catch (error) {
    return sendError(res, error, "Lỗi xoá thông báo đã đọc", "deleteAllRead");
  }
};

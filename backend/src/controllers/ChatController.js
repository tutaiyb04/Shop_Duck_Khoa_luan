const chatService = require("../services/chatService");
const { notifyConversationUpdated } = require("../utils/chatSocketNotify");

const userIdOf = (req) => {
  return req.user?._id || req.user?.id;
};

// mở hội thoại mới hoặc lấy hội thoại cũ
exports.postOpen = async (req, res) => {
  try {
    const uid = userIdOf(req);

    if (!uid) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Thiếu productId" });
    }

    const data = await chatService.openOrGetConversation(uid, productId);

    return res.json(data);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("Lỗi postOpen:", error);
    return res
      .status(500)
      .json({ message: error.message || "Lỗi mở hội thoại" });
  }
};

// danh sách hội thoại của người dùng
exports.getConversations = async (req, res) => {
  try {
    const uid = userIdOf(req);

    if (!uid) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const conversations = await chatService.listConversations(uid);

    return res.json({ conversations });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }

    console.error("Lỗi getConversations:", error);
    return res
      .status(500)
      .json({ message: error.message || "Lỗi lấy danh sách hội thoại" });
  }
};

// ẩn hội thoại khỏi danh sách của người dùng
exports.softDeleteConversation = async (req, res) => {
  try {
    const uid = userIdOf(req);

    if (!uid) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const { conversationId } = req.params;

    await chatService.softHideConversationForUser(uid, conversationId);
    notifyConversationUpdated(conversationId).catch(() => {}); // gửi thông báo đến người dùng khác trong hội thoại

    return res.json({ message: "Đã ẩn hội thoại khỏi danh sách của bạn." });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("Lỗi softDeleteConversation:", error);
    return res
      .status(500)
      .json({ message: error.message || "Lỗi khi ẩn hội thoại" });
  }
};

exports.getConversationMessages = async (req, res) => {
  try {
    const uid = userIdOf(req);

    if (!uid) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    // lấy tin nhắn của hội thoại
    const { conversationId } = req.params;

    const data = await chatService.getMessages(conversationId, uid);

    return res.json(data);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("Lỗi getConversationMessages:", error);
    return res
      .status(500)
      .json({ message: error.message || "Lỗi lấy tin nhắn" });
  }
};

// tải ảnh lên hội thoại
exports.postUploadChatImages = async (req, res) => {
  try {
    const uid = userIdOf(req);

    if (!uid) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const files = req.files || [];

    if (!files.length) {
      return res.status(400).json({ message: "Chọn ít nhất một ảnh" });
    }

    const urls = files.map((f) => f.path).filter(Boolean);

    return res.json({ urls });
  } catch (error) {
    console.error("Lỗi postUploadChatImages:", error);
    return res
      .status(500)
      .json({ message: error.message || "Lỗi tải ảnh lên" });
  }
};

// danh sách tất cả những người đã từng nhắn tin hỏi mua món hàng này
exports.getProductSaleCandidates = async (req, res) => {
  try {
    // Xác thực người dùng
    const sellerId = userIdOf(req);

    if (!sellerId) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    // Lấy productId từ params
    const { productId } = req.params;

    // Lấy danh sách người mua
    const data = await chatService.listChatBuyersForProduct(
      sellerId,
      productId,
    );

    return res.json(data);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("Lỗi getProductSaleCandidates:", error);
    return res
      .status(500)
      .json({ message: error.message || "Lỗi lấy danh sách người mua" });
  }
};

// gửi tin nhắn
exports.postMessage = async (req, res) => {
  try {
    const uid = userIdOf(req);

    if (!uid) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const { conversationId } = req.body;

    const text = typeof req.body?.text === "string" ? req.body.text : "";

    const images = Array.isArray(req.body?.images) ? req.body.images : [];

    const message = await chatService.sendMessage(uid, {
      conversationId,
      text,
      images,
    });

    notifyConversationUpdated(conversationId).catch(() => {});

    return res.status(201).json({
      message: "Đã gửi tin nhắn",
      data: message,
    });
  } catch (error) {
    if (error.status) {
      const body = { message: error.message };

      // Trả thêm metadata khi hội thoại bị đóng băng để FE khóa giao diện đúng nguyên nhân.
      if (error.code === "CHAT_FROZEN") {
        body.code = error.code;
        body.productStatus = error.productStatus || null;
        body.isFrozen = true;
      }

      return res.status(error.status).json(body);
    }
    console.error("Lỗi postMessage:", error);
    return res
      .status(500)
      .json({ message: error.message || "Lỗi gửi tin nhắn" });
  }
};

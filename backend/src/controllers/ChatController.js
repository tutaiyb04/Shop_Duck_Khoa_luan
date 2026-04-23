const chatService = require("../services/chatService");

function userIdOf(req) {
  return req.user?._id || req.user?.id;
}

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

exports.getConversationMessages = async (req, res) => {
  try {
    const uid = userIdOf(req);
    if (!uid) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }
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

exports.postMessage = async (req, res) => {
  try {
    const uid = userIdOf(req);
    if (!uid) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }
    const { conversationId, text, images } = req.body;
    const message = await chatService.sendMessage(uid, {
      conversationId,
      text,
      images,
    });
    return res.status(201).json({
      message: "Đã gửi tin nhắn",
      data: message,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("Lỗi postMessage:", error);
    return res
      .status(500)
      .json({ message: error.message || "Lỗi gửi tin nhắn" });
  }
};

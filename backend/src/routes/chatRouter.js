const express = require("express");
const router = express.Router();
const chatController = require("../controllers/ChatController");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");
const {
  chatMessageLimiter,
  chatUploadLimiter,
} = require("../middleware/chatRateLimit");

router.get("/conversations", protect, chatController.getConversations);
router.post("/open", protect, chatController.postOpen);
router.post(
  "/upload-images",
  protect,
  chatUploadLimiter,
  upload.array("images", 5),
  chatController.postUploadChatImages,
);
router.post("/message", protect, chatMessageLimiter, chatController.postMessage);
router.delete(
  "/conversations/:conversationId",
  protect,
  chatController.softDeleteConversation,
);
router.get("/:conversationId", protect, chatController.getConversationMessages);

module.exports = router;

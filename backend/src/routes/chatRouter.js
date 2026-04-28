const express = require("express");
const router = express.Router();
const chatController = require("../controllers/ChatController");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");
const {
  chatMessageLimiter,
  chatUploadLimiter,
} = require("../middleware/chatRateLimit");
const { uploadProductImages } = require("../middleware/uploadMiddleware");

router.get("/conversations", protect, chatController.getConversations);
/** Phải khai báo trước /:conversationId (tránh coi "product" là id hội thoại) */
router.get(
  "/product/:productId/sale-candidates",
  protect,
  chatController.getProductSaleCandidates,
);
router.post("/open", protect, chatController.postOpen);
router.post(
  "/upload-images",
  protect,
  chatUploadLimiter,
  uploadProductImages("images", 10),
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

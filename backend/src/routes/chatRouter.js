const express = require("express");
const router = express.Router();
const chatController = require("../controllers/ChatController");
const { protect } = require("../middleware/authMiddleware");

router.get("/conversations", protect, chatController.getConversations);
router.post("/open", protect, chatController.postOpen);
router.post("/message", protect, chatController.postMessage);
router.get("/:conversationId", protect, chatController.getConversationMessages);

module.exports = router;

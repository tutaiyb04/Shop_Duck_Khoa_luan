const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/NotificationController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, notificationController.getMyNotifications);
router.get("/unread-count", protect, notificationController.getUnreadCount);
router.patch("/read", protect, notificationController.markManyAsRead);
router.patch("/read-all", protect, notificationController.markAllAsRead);
router.patch("/:id/read", protect, notificationController.markOneAsRead);
router.delete("/read", protect, notificationController.deleteAllRead);
router.delete("/:id", protect, notificationController.deleteOne);

module.exports = router;

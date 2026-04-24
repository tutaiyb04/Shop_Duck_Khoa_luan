const express = require("express");
const router = express.Router();
const reportController = require("../controllers/ReportController");
const { protect } = require("../middleware/authMiddleware");

router.get("/admin/all", protect, reportController.getAdminReports);
router.put("/admin/:id/resolve", protect, reportController.resolveReport);
router.post("/chat", protect, reportController.createChatReport);
router.post("/", protect, reportController.createReport);

module.exports = router;

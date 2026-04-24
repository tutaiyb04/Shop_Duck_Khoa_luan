const express = require("express");
const router = express.Router();
const { protect, isAdmin } = require("../middleware/authMiddleware");
const adminDashboardController = require("../controllers/AdminDashboardController");

router.get("/stats", protect, isAdmin, adminDashboardController.getStats);

module.exports = router;

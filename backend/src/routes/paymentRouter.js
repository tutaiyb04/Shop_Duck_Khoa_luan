const express = require("express");
const router = express.Router();
const { protect, isAdmin } = require("../middleware/authMiddleware");
const paymentController = require("../controllers/PaymentController");

router.post("/create-vip-link", protect, paymentController.createVipPaymentLink);
router.post("/webhook", paymentController.handlePayOSWebhook);
router.post("/confirm-vip", protect, paymentController.confirmVipAfterReturn);
router.get(
  "/admin/vip-transactions",
  protect,
  isAdmin,
  paymentController.getAdminVipTransactions,
);

module.exports = router;

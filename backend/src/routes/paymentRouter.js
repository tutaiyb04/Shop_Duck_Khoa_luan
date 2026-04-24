const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const paymentController = require("../controllers/PaymentController");

router.post("/create-vip-link", protect, paymentController.createVipPaymentLink);
router.post("/confirm-vip", protect, paymentController.confirmVipAfterReturn);
router.post("/webhook", paymentController.handlePayOSWebhook);

module.exports = router;

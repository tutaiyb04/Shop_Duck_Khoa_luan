const express = require("express");
const router = express.Router();
const orderController = require("../controllers/OrderController");
const { protect } = require("../middleware/authMiddleware");

router.post(
  "/complete-offline-sale",
  protect,
  orderController.postCompleteOfflineSale,
);
router.get(
  "/sales/history",
  protect,
  orderController.getSalesHistory,
);
router.get(
  "/purchases/history",
  protect,
  orderController.getPurchaseHistory,
);

module.exports = router;

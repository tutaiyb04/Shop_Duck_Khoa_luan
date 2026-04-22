const express = require("express");
const router = express.Router();

const productController = require("../controllers/ProductController");
const { protect, isAdmin } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

router.post(
  "/create-product",
  protect,
  upload.array("images", 5), // Bắt tối đa 5 file ảnh có key là 'images'
  productController.createProduct,
);
router.put(
  "/:id",
  protect, // Phải đăng nhập
  upload.array("images", 5), // Xử lý upload ảnh (nếu có)
  productController.updateProduct,
);
router.put(
  "/admin/:id/status",
  protect,
  isAdmin,
  productController.updateAdminProductStatus,
);
router.patch("/:id/status", protect, productController.updateMyProductStatus);
router.get("/my-products/all", protect, productController.getMyProducts);
router.get("/admin/all", protect, isAdmin, productController.getAdminProducts);
router.get("/:id", productController.getProductById);
router.get("/", productController.getAllProducts);

module.exports = router;

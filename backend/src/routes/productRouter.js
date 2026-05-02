const express = require("express");
const router = express.Router();

const productController = require("../controllers/ProductController");
const { protect, isAdmin } = require("../middleware/authMiddleware");
const { uploadProductImagesMemory } = require("../middleware/uploadMiddleware");

router.post(
  "/create-product",
  protect,
  uploadProductImagesMemory("images", 5),
  productController.createProduct,
);
router.put(
  "/:id",
  protect, // Phải đăng nhập
  uploadProductImagesMemory("images", 5),
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
router.get("/shop/:sellerId", productController.getSellerShopListing);
router.get(
  "/seller-catalog/:sellerId",
  productController.getSellerCatalogGrouped,
);
router.get(
  "/recommendations",
  protect,
  productController.getMyRecommendations,
);
router.get("/:id", productController.getProductById);
router.get("/", productController.getAllProducts);

module.exports = router;

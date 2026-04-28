const express = require("express");
const router = express.Router();

const productController = require("../controllers/ProductController");
const { protect, isAdmin } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

/** Multer/Cloudinary báo lỗi → trả JSON rõ ràng thay vì 500 không nội dung */
function uploadProductImages(req, res, next) {
  upload.array("images", 5)(req, res, (err) => {
    if (err) {
      console.error("Upload ảnh sản phẩm:", err);
      return res.status(400).json({
        message:
          err.message ||
          "Không tải được ảnh lên — kiểm tra định dạng (JPG, PNG, WebP) hoặc cấu hình Cloudinary trên server.",
      });
    }
    next();
  });
}

router.post(
  "/create-product",
  protect,
  uploadProductImages,
  productController.createProduct,
);
router.put(
  "/:id",
  protect, // Phải đăng nhập
  uploadProductImages,
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

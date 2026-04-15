const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/CategoryController");
const { isAdmin, protect } = require("../middleware/authMiddleware");

router.get("/", CategoryController.getPublicCategories);
router.get(
  "/admin/all",
  protect,
  isAdmin,
  CategoryController.getAdminCategories,
);
router.post(
  "/create-category",
  protect,
  isAdmin,
  CategoryController.createCategory,
);
router.put(
  "/update-category/:id",
  protect,
  isAdmin,
  CategoryController.updateCategory,
);
router.delete(
  "/delete-category/:id",
  protect,
  isAdmin,
  CategoryController.deleteCategory,
);
router.put(
  "/:id/restore",
  protect,
  isAdmin,
  CategoryController.restoreCategory,
);

module.exports = router;

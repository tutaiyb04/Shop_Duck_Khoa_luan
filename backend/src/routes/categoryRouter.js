const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/CategoryController");
const { isAdmin, protect } = require("../middleware/authMiddleware");

router.get("/", CategoryController.getPublicCategories);
router.get("/admin/all", isAdmin, CategoryController.getAdminCategories);
router.post("/create-category", isAdmin, CategoryController.createCategory);
router.put("/update-category/:id", isAdmin, CategoryController.updateCategory);
router.delete(
  "/delete-category/:id",
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

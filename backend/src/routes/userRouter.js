const express = require("express");

const userController = require("../controllers/UserController");
const { protect, isAdmin } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

const router = express.Router();

// router.post("/admin-login", userController.createSuperAdmin);
router.post("/google-login", userController.googleLogin);
router.post("/reset-password", userController.resetPassword);
router.post("/forgot-password", userController.forgotPassword);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/verify-email", userController.verifyEmail);
router.post("/request-verify", protect, userController.requestEmailVerify);
router.post("/wishlist/toggle", protect, userController.toggleWishlist);
router.get("/wishlist", protect, userController.getWishlist);
router.get("/admin/all", protect, isAdmin, userController.getUsersAdmin);
router.get("/profile", protect, userController.getProfile);
router.put(
  "/admin/:id/status",
  protect,
  isAdmin,
  userController.updateUserStatus,
);
router.put(
  "/update-profile",
  protect,
  upload.single("avatar"),
  userController.updateProfile,
);

module.exports = router;

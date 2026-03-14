const express = require("express");

const userController = require("../controllers/UserController");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

const router = express.Router();

router.post("/phone-login", userController.phoneLogin);
router.post("/facebook-login", userController.facebookLogin);
router.post("/google-login", userController.googleLogin);
router.post("/reset-password", userController.resetPassword);
router.post("/forgot-password", userController.forgotPassword);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", protect, userController.getProfile);
router.put("/update-profile", protect, upload.single("avatar") ,userController.updateProfile);

module.exports = router;

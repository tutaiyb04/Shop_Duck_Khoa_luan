const User = require("../model/User");
const userService = require("../services/userServices");

exports.register = async (req, res) => {
  try {
    const { username, password, email, avatar } = req.body;

    const { newUser } = await userService.registerService(
      username,
      password,
      email,
      avatar,
    );

    res.status(201).json({
      message: "Tài khoản được đăng ký thành công",
      user: newUser,
    });
  } catch (error) {
    console.log("Lỗi khi gọi register: ", error);
    res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const { findUser, token } = await userService.loginService(
      username,
      email,
      password,
    );

    res.status(200).json({
      message: "Đăng nhập thành công!",
      token,
      user: findUser,
    });
  } catch (error) {
    console.log("Lỗi khi gọi login: ", error);
    res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    await userService.resetPasswordService(email);

    res
      .status(200)
      .json({ message: "Đã gửi link khôi phục vào email của bạn!" });
  } catch (error) {
    console.log("Lỗi khi gọi resetPassword: ", error);
    res.status(400).json({ message: error.message || "Lỗi hệ thống" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    await userService.updatePasswordService(token, newPassword);

    res
      .status(200)
      .json({ message: "Mật khẩu đã được thay đổi. Vui lòng đăng nhập!" });
  } catch (error) {
    console.log("Lỗi khi gọi resetPasswordConfirm: ", error);
    res.status(400).json({ message: error.message || "Lỗi hệ thống" });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const { user, ggToken: ggToken } =
      await userService.loginWithGoogleService(token);

    res.status(200).json({
      message: "Đăng nhập Google thành công!",
      user: user,
      token: ggToken,
    });
  } catch (error) {
    console.log("Lỗi khi gọi googleLogin: ", error);
    res.status(400).json({ message: error.message || "Lỗi hệ thống" });
  }
};

exports.getProfile = (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      message: "Lấy thông tin thành công",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        authType: user.authType,
        isEmailVerified: user.isEmailVerified,
        address: user.buyerProfile?.shippingAddresses[0] || "",
        description: user.sellerProfile?.description,
        role: user.role,
        sellerProfile: user.sellerProfile,
        buyerProfile: user.buyerProfile,
      },
    });
  } catch (error) {
    console.log("Lỗi khi gọi getProfile: ", error);
    res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Thiếu mã xác minh" });
    }

    // Gọi service đã được tối ưu
    const updatedUser = await userService.verifyEmailService(token);

    res.status(200).json({
      message: "Xác minh Email thành công! Bạn đã có thể bắt đầu bán hàng.",
      // Trả về một phần data nếu Frontend cần cập nhật state ngay lập tức
      isVerified: updatedUser.isEmailVerified,
    });
  } catch (error) {
    console.log("Lỗi tại verifyEmail: ", error);
    res.status(400).json({ message: error.message || "Lỗi hệ thống" });
  }
};

exports.requestEmailVerify = async (req, res) => {
  try {
    const userId = req.user.id;
    await userService.sendVerificationEmailService(userId);
    res.status(200).json({
      message: "Email xác minh đã được gửi! Vui lòng kiểm tra hộp thư.",
    });
  } catch (error) {
    res.status(400).json({ message: error.message || "Lỗi hệ thống" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    // Kiểm tra an toàn biến req.user từ middleware
    if (!req.user) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    // lấy req.user đã đc giải mã từ middleware protect
    const userId = req.user._id || req.user.id;
    const { username, phone, address, description } = req.body;

    // Lấy file ảnh Multer đã xử lý
    const file = req.file;

    const { updateUser } = await userService.updateProfileService(
      userId,
      username,
      phone,
      address,
      description,
      file,
    );

    res.status(200).json({
      message: "Cập nhật hồ sơ thành công",
      user: {
        id: updateUser._id,
        username: updateUser.username,
        email: updateUser.email,
        phone: updateUser.phone,
        avatar: updateUser.avatar,
        address: updateUser.buyerProfile?.shippingAddresses[0] || "",
        role: updateUser.role,
      },
    });
  } catch (error) {
    console.log("Lỗi khi updateProfile: ", error);
    res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

exports.createSuperAdmin = async (req, res) => {
  try {
    // 1. Kiểm tra xem tài khoản admin này đã tồn tại chưa để tránh tạo trùng
    const adminExists = await User.findOne({ username: "superadmin" });
    if (adminExists) {
      return res
        .status(400)
        .json({ message: "Tài khoản Super Admin đã tồn tại!" });
    }

    // 2. Khởi tạo tài khoản Admin
    const newAdmin = new User({
      username: "Admin",
      phone: "0344076552",
      email: "tutai241104@gmail.com",
      password: "Admin@1234",
      role: "admin",
      authType: "local",
    });

    // 3. Lưu vào Database
    await newAdmin.save();

    return res.status(201).json({
      message: "Khởi tạo Super Admin thành công!",
      admin: {
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    console.error("Lỗi tạo Super Admin:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server", error: error.message });
  }
};

exports.getUsersAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;

    const { users, totalPages, currentPage } =
      await userService.getUsersAdminService(page, limit);

    return res.status(200).json({
      message: "Lấy danh sách người dùng thành công",
      users,
      totalPages,
      currentPage,
    });
  } catch (error) {
    console.log("Lỗi tại getUsersAdmin: ", error);
    return res.status(500).json({
      message: error.message || "Lỗi server khi lấy danh sách người dùng",
    });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params; // Lấy userId từ URL (/admin/:id/status)
    const { status } = req.body; // Lấy status ("locked" hoặc "active") từ body

    // Kiểm tra đầu vào cơ bản
    if (!status || !["active", "locked"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    // Gọi hàm Service để update
    const updatedUser = await userService.updateUserStatusService(id, status);

    return res.status(200).json({
      message: `Đã ${status === "locked" ? "khóa" : "mở khóa"} tài khoản thành công`,
      user: updatedUser,
    });
  } catch (error) {
    console.log("Lỗi tại updateUserStatus: ", error);
    return res.status(500).json({
      message: error.message || "Lỗi server khi cập nhật trạng thái người dùng",
    });
  }
};

exports.toggleWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Thiếu mã sản phẩm" });
    }

    const { isLiked } = await userService.toggleWishlistService(
      userId,
      productId,
    );

    return res.status(200).json({
      message: isLiked
        ? "Đã thêm vào danh sách yêu thích"
        : "Đã xóa khỏi danh sách yêu thích",
      isLiked,
    });
  } catch (error) {
    console.log("Lỗi tại toggleWishlist:", error);
    res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlist = await userService.getWishlistService(userId);

    return res.status(200).json({
      message: "Lấy danh sách yêu thích thành công",
      wishlist,
    });
  } catch (error) {
    console.log("Lỗi tại getWishlist:", error);
    res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

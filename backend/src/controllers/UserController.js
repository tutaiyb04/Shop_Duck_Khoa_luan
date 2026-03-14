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
      file,
    );

    res.status(200).json({
      message: "Đăng nhập thành công!",
      token,
      user: {
        id: findUser._id,
        username: findUser.username,
        email: findUser.email,
      },
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

exports.facebookLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const { user, fbToken: fbToken } =
      await userService.loginWithFacebookService(token);

    res.status(200).json({
      message: "Đăng nhập Facebook thành công !",
      user: user,
      token: fbToken,
    });
  } catch (error) {
    console.log("Lỗi khi gọi facebookLogin: ", error);
    res.status(400).json({ message: error.message || "Lỗi hệ thống" });
  }
};

exports.phoneLogin = async (req, res) => {
  try {
    const { phone } = req.body;

    const { user, phoneToken: phoneToken } =
      await userService.loginWithPhoneService(phone);

    if (!phone) {
      return res.status(404).json({ message: "Số điện thoại không tồn tại" });
    }

    res.status(200).json({
      message: "Đăng nhập bằng số điện thoại thành công !",
      user: user,
      token: phoneToken,
    });
  } catch (error) {
    console.log("Lỗi khi gọi phoneLogin: ", error);
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
        address: user.buyerProfile?.shippingAddresses[0] || "",
        role: user.role,
        sellerProfile: user.sellerProfile, // Có thể trả về thêm nếu cần hiển thị
      },
    });
  } catch (error) {
    console.error("Lỗi khi gọi getProfile: ", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    // Kiểm tra an toàn biến req.user từ middleware
    if (!req.user) {
      return res.status(401).json({ message: "Lỗi xác thực Token!" });
    }

    // lấy req.user đã đc giải mã từ middleware protect
    const userId = req.user._id || req.user.id;
    const { username, phone, address } = req.body;

    // Lấy file ảnh Multer đã xử lý
    const file = req.file;

    const { updateUser } = await userService.updateProfileService(
      userId,
      username,
      phone,
      address,
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
    console.error("Lỗi khi updateProfile: ", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

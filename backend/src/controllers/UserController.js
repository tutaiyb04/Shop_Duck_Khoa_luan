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
  res.send("Thông tin tài khoản");
};

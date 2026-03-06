const dotenv = require("dotenv");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../model/User");
const sendEmail = require("../helper/sendEmail");

dotenv.config();

exports.registerService = async (username, password, email, avatar) => {
  // Kiểm tra xem Email đã được sử dụng hay chưa
  const userExits = await User.findOne({
    $or: [
      {
        username: username,
      },
      {
        email: email,
      },
    ],
  });
  if (userExits) {
    if (userExits.username === username) {
      throw new Error("Tên đăng nhập đã được sử dụng");
    }

    if (userExits.email === email) {
      throw new Error("Email đã được sử dụng!");
    }
  }

  // Tạo vào lưu tài khoản
  const user = new User({ username, password, email, avatar });
  const newUser = await user.save();

  return newUser;
};

exports.loginService = async (username, email, password) => {
  // tìm user theo email HOẶC email
  const findUser = await User.findOne({
    $or: [
      {
        username: username,
      },
      {
        email: email,
      },
    ],
  }).select("+password");
  if (!findUser) {
    throw new Error("Username hoặc Email không tồn tại!");
  }

  if (!findUser.password) {
    throw new Error(
      "Tài khoản này được đăng ký bằng Mạng xã hội/Số điện thoại. Hãy đăng nhập bằng hình thức tương ứng.",
    );
  }

  // kiểm tra mật khẩu
  const isMatch = await bcrypt.compare(password, findUser.password);
  if (!isMatch) {
    throw new Error("Mật khẩu không chính xác");
  }

  console.log("Đã tìm thấy User ID: ", findUser._id);

  // tạo token
  const payload = {
    id: findUser._id,
    username: findUser.username,
    email: findUser.email,
    role: findUser.role,
  };
  const secretKey = process.env.SECRET_KEY;
  const token = jwt.sign(payload, secretKey, {
    expiresIn: "1d",
  });

  return { token, findUser };
};

exports.resetPasswordService = async (email) => {
  const findUserHaveEmail = await User.findOne({ email });
  if (!findUserHaveEmail) {
    throw new Error("Email không tồn tại !");
  }

  // Tạo mã reset mật khẩu
  const randomToken = await new Promise((resolve, reject) => {
    crypto.randomBytes(16, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer.toString("hex"));
      }
    });
  });

  // Tạo thời hạn cho mã reset Password
  const resetPasswordExpires = Date.now() + 15 * 60 * 1000;

  // Cập nhật mã reset và thời hạn reset password vào User
  findUserHaveEmail.resetPasswordToken = randomToken;
  findUserHaveEmail.resetPasswordExpires = resetPasswordExpires;
  await findUserHaveEmail.save();

  // tạo url để gửi mã đặt lại mật khẩu
  const resetUrl =
    "http://localhost:5173/reset-password-confirm?token=" + randomToken;

  try {
    sendEmail({
      email: findUserHaveEmail.email,
      subject: "Yêu cầu đặt lại mật khẩu",
      html: `
      <h3>Xin chào ${findUserHaveEmail.username},</h3>
      <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
      <p>Vui lòng click vào đường link bên dưới để tạo mật khẩu mới:</p>
      <a href="${resetUrl}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">
        ĐẶT LẠI MẬT KHẨU
      </a>
      <p><i>Lưu ý: Đường link này chỉ có hiệu lực trong vòng 15 phút.</i></p>
    `,
    });
  } catch (error) {
    console.log("Lỗi khi gọi sendMail: ", error);
    throw new Error("Lỗi khi gửi email");
  }

  return true;
};

exports.updatePasswordService = async (token, newPassword) => {
  const findUserHavePassword = await User.findOne({
    resetPasswordToken: token,
  });

  if (!findUserHavePassword) {
    throw Error("Mã xác thực không hợp lệ hoặc không tồn tại!");
  }

  if (findUserHavePassword.resetPasswordExpires < Date.now()) {
    throw new Error("Mã xác thực đã hết hạn! Vui lòng yêu cầu gửi lại email.");
  }

  findUserHavePassword.password = newPassword;
  findUserHavePassword.resetPasswordToken = undefined;
  findUserHavePassword.resetPasswordExpires = undefined;
  await findUserHavePassword.save();

  return true;
};

exports.loginWithGoogleService = async (accessToken) => {
  try {
    // Gọi API Google
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const payload = await response.json();

    if (payload.error) {
      throw new Error("Token Google không hợp lệ hoặc đã hết hạn!");
    }

    const { email, name, picture, sub } = payload;

    let user = await User.findOne({ email });

    // Nếu là khách hàng cũ (đã từng đăng ký và có tài khoản)
    if (user) {
      if (!user.googleId) {
        await User.updateOne({ _id: user._id }, { $set: { googleId: sub } });
      }
    }
    // Nếu là khách hàng mới (chưa đăng ký bao giờ)
    else {
      user = await User.create({
        username: name,
        email: email,
        avatar: picture,
        authType: "google",
        googleId: sub,
      });
    }

    const payloadJwt = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const ggToken = jwt.sign(payloadJwt, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    return { user: user, ggToken: ggToken };
  } catch (error) {
    console.log("Lỗi catch được: ", error);
    throw new Error("Xác thực google thất bại");
  }
};

exports.loginWithFacebookService = async (facebookToken) => {
  try {
    // lấy Graph API từ facebook ra
    const facebookData =
      "https://graph.facebook.com/me?fields=id,name,email,picture&access_token=" +
      facebookToken;

    // lấy thông tin user từ Graph API
    const response = await fetch(facebookData);
    const data = await response.json();

    if (data.error) {
      console.log("Lỗi Facebook: ", data.error);
      throw new Error("Token Facebook bị sai hoặc hết hạn!");
    }

    const { id, name, email, picture } = data;
    const avatarUrl = picture?.data?.url || "";

    let user = await User.findOne({ email });

    if (user) {
      if (!user.facebookId) {
        user.facebookId = id;
        await user.save();
      }
    } else {
      user = new User({
        username: name,
        email: email,
        avatar: avatarUrl,
        authType: "facebook",
        facebookId: id,
      });
      await user.save();
    }

    const payloadJwt = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const fbToken = jwt.sign(payloadJwt, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    return { user: user, fbToken: fbToken };
  } catch (error) {
    console.log("Lỗi catch được: ", error);
    throw new Error("Xác thực facebook thất bại");
  }
};

exports.loginWithPhoneService = async (phone) => {
  try {
    // tìm user theo phone
    let user = await User.findOne({ phone });

    if (!user) {
      const cleanPhone = phone.replace("+", "");

      const randomStr = Math.random().toString(36).substring(2, 6);
      user = new User({
        username: `user_${cleanPhone}_${randomStr}`,
        email: `phone_${cleanPhone}@gmail.com`,
        authType: "phone",
        phone: phone,
      });
      await user.save();
    }

    const payloadJwt = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const phoneToken = jwt.sign(payloadJwt, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    return {
      user,
      phoneToken: phoneToken,
    };
  } catch (error) {
    console.log("Lỗi catch được: ", error);
    throw new Error("Xác thực số điện thoại thất bại");
  }
};

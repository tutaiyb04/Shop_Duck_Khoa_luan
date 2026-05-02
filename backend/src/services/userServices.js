const dotenv = require("dotenv");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const util = require("util");

const User = require("../model/User");
const Product = require("../model/Product");
const sendEmail = require("../helper/sendEmail");
const notificationService = require("./notificationService");
const recommendationService = require("./recommendationService");

dotenv.config();

const randomBytesAsync = util.promisify(crypto.randomBytes);

exports.registerService = async (username, password, email, avatar) => {
  try {
    const newUser = await User.create({
      username,
      password,
      email,
      avatar,
      // Mặc định isEmailVerified là false (đảm bảo schema của bạn có trường này)
    });
    return { newUser };
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern?.username)
        throw new Error("Tên đăng nhập đã được sử dụng");
      if (error.keyPattern?.email) throw new Error("Email đã được sử dụng!");
    }
    throw error;
  }
};

exports.sendVerificationEmailService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("Người dùng không tồn tại");

  // Chỉ cho phép user type local xác minh
  if (user.authType !== "local") {
    throw new Error("Tài khoản mạng xã hội đã được xác minh tự động");
  }

  if (user.isEmailVerified) {
    throw new Error("Email này đã được xác minh rồi");
  }

  // Tạo token mới
  const buffer = await randomBytesAsync(32);
  const verificationToken = buffer.toString("hex");
  const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = emailVerificationExpires;
  await user.save();

  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  await sendEmail({
    email: user.email,
    subject: "Xác minh tài khoản Duck Shop",
    html: `<h3>Chào ${user.username}!</h3>
           <p>Bạn vừa yêu cầu gửi mã xác minh. Vui lòng nhấn vào link sau để hoàn tất: 
           <a href="${verifyUrl}">Xác minh ngay</a></p>
           <p>Link có hiệu lực trong 24h.</p>`,
  });

  return true;
};

exports.verifyEmailService = async (token) => {
  // Tìm user có token này trước để phân biệt lỗi
  const user = await User.findOne({ emailVerificationToken: token });

  if (!user) {
    // Nếu không thấy user có token này, có thể họ đã xác minh rồi (token đã bị xóa)
    throw new Error(
      "Liên kết không hợp lệ hoặc bạn đã xác minh tài khoản trước đó.",
    );
  }

  if (user.emailVerificationExpires < Date.now()) {
    throw new Error(
      "Liên kết xác minh đã hết hạn. Vui lòng yêu cầu gửi lại email mới.",
    );
  }

  // Nếu mọi thứ ổn, tiến hành cập nhật
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  user["sellerProfile.isVerified"] = true; // Kích hoạt quyền bán hàng
  await user.save();

  return user;
};

exports.loginService = async (username, email, password) => {
  // tìm user theo email HOẶC email
  const findUser = await User.findOne({
    $or: [{ username: username }, { email: email }],
  })
    .select("+password")
    .lean();

  if (!findUser) {
    throw new Error("Username hoặc Email không tồn tại!");
  }

  if (findUser.status === "locked") {
    throw new Error(
      "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!",
    );
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

  // tạo token
  const payload = {
    id: findUser._id,
    username: findUser.username,
    email: findUser.email,
    role: findUser.role,
    avatar: findUser.avatar,
    address: findUser.buyerProfile?.shippingAddresses[0] || "",
    description: findUser.sellerProfile?.description,
    sellerProfile: findUser.sellerProfile,
    buyerProfile: findUser.buyerProfile,
  };
  const secretKey = process.env.SECRET_KEY;
  const token = jwt.sign(payload, secretKey, {
    expiresIn: "8h",
  });

  // Xóa password trước khi trả về Frontend (vì dùng lean() nên phải xóa thủ công)
  delete findUser.password;

  return { token, findUser };
};

exports.resetPasswordService = async (email) => {
  // Tạo mã reset mật khẩu (Bất đồng bộ để không block event loop)
  const randomToken = await new Promise((resolve, reject) => {
    crypto.randomBytes(16, (err, buffer) => {
      if (err) reject(err);
      else resolve(buffer.toString("hex"));
    });
  });

  const resetPasswordExpires = Date.now() + 15 * 60 * 1000;

  const findUserHaveEmail = await User.findOneAndUpdate(
    { email },
    { resetPasswordToken: randomToken, resetPasswordExpires },
    { returnDocument: "after", lean: true },
  );

  if (!findUserHaveEmail) {
    throw new Error("Email không tồn tại !");
  }

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontendUrl}/reset-password-confirm?token=${randomToken}`;

  try {
    await sendEmail({
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
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const payload = await response.json();

    if (payload.error)
      throw new Error("Token Google không hợp lệ hoặc đã hết hạn!");

    const { email, name, picture, sub } = payload;

    let user = await User.findOne({ email });

    if (user && user.status === "locked") {
      throw new Error(
        "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!",
      );
    }

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
        isEmailVerified: false,
      });
    }

    const payloadJwt = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const ggToken = jwt.sign(payloadJwt, process.env.SECRET_KEY, {
      expiresIn: "8h",
    });

    return { user: user, ggToken: ggToken };
  } catch (error) {
    console.log("Lỗi catch được: ", error);
    throw new Error("Xác thực google thất bại");
  }
};

exports.updateProfileService = async (
  userId,
  username,
  phone,
  address,
  description,
  file,
  storeName,
) => {
  try {
    // Khởi tạo object chứa dữ liệu cần cập nhật
    const updateData = {};
    if (username) updateData.username = username;
    if (phone) updateData.phone = phone;

    if (description !== undefined)
      updateData["sellerProfile.description"] = description;

    if (storeName !== undefined)
      updateData["sellerProfile.storeName"] = storeName;

    if (address !== undefined)
      updateData["buyerProfile.shippingAddresses"] = [address];

    if (file && file.path) updateData.avatar = file.path;

    // Cập nhật vào DB
    const updateUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { returnDocument: "after", runValidators: true },
    );

    return { updateUser };
  } catch (error) {
    console.log("Lỗi catch được: ", error);
    throw new Error("Tên hiển thị đã tồn tại");
  }
};

exports.getUsersAdminService = async (page = 1, limit = 15) => {
  try {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find()
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(),
    ]);

    return {
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Lỗi tại getUsersAdminService: ", error);
    throw new Error("Không thể lấy danh sách Users");
  }
};

exports.updateUserStatusService = async (userId, status) => {
  try {
    const updateUser = await User.findByIdAndUpdate(
      userId,
      { status },
      { returnDocument: "after", runValidators: true },
    );

    if (!updateUser) throw new Error("Không tìm thấy người dùng");

    return { updateUser };
  } catch (error) {
    console.error("Lỗi tại updateUserStatusService: ", error);
    throw new Error("Không thể khóa tài khoản");
  }
};

exports.toggleWishlistService = async (userId, productId) => {
  const isExist = await User.exists({
    _id: userId,
    "buyerProfile.wishlist": productId,
  });

  // Dùng $pull để xóa, hoặc $addToSet để thêm (addToSet an toàn hơn $push vì nó tự chặn trùng lặp).
  const updateQuery = isExist
    ? { $pull: { "buyerProfile.wishlist": productId } }
    : { $addToSet: { "buyerProfile.wishlist": productId } };

  // bắn thẳng 1 request duy nhất xuống DB để tự xử lý
  const result = await User.updateOne({ _id: userId }, updateQuery);

  if (result.matchedCount === 0) {
    throw new Error("Người dùng không tồn tại");
  }

  const isLiked = !isExist;

  // Chỉ gửi thông báo khi vừa LIKE (không gửi khi UNLIKE).
  // Helper notifyProductLiked tự gom nhóm theo productId (groupKey) — nhiều người
  // cùng like 1 sản phẩm sẽ chỉ tạo 1 thông báo trong inbox người bán.
  if (isLiked) {
    Product.findById(productId)
      .select("sellerId name")
      .lean()
      .then((p) => {
        if (!p?.sellerId) return null;
        return notificationService.notifyProductLiked({
          sellerId: p.sellerId,
          productId,
          productName: p.name,
          actorId: userId,
        });
      })
      .catch((e) => console.error("notifyProductLiked:", e));
  }

  recommendationService
    .invalidateUserRecommendation(userId)
    .catch((e) =>
      console.error("invalidateUserRecommendation(wishlist):", e),
    );

  return { isLiked };
};

exports.getWishlistService = async (userId) => {
  const user = await User.findById(userId)
    .select("buyerProfile.wishlist")
    .populate({
      path: "buyerProfile.wishlist",
      // select các trường thật sự cần thiết để vẽ giao diện ProductCard
      select: "name price images condition location status category",
      populate: { path: "category", select: "name" },
    })
    .lean();

  if (!user) throw new Error("Người dùng không tồn tại");

  return user.buyerProfile.wishlist || [];
};

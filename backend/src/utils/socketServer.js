const jwt = require("jsonwebtoken");
const User = require("../model/User");

/**
 * Chỉ chấp nhận kết nối khi có JWT hợp lệ trong handshake.auth (giống Bearer REST).
 * userId / room chỉ từ token + DB, không từ client tự gửi (tránh giả mạo).
 */
function setupSocketIO(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token || typeof token !== "string") {
        return next(new Error("Thiếu token"));
      }
      const secretKey = process.env.SECRET_KEY;
      if (!secretKey) {
        return next(new Error("Cấu hình server thiếu SECRET_KEY"));
      }

      const decoded = jwt.verify(token, secretKey);
      const id = decoded.id || decoded._id;
      const user = await User.findById(id).select("-password");

      if (!user) {
        return next(new Error("Tài khoản không tồn tại"));
      }
      if (user.status === "locked") {
        return next(new Error("Tài khoản bị khóa"));
      }

      socket.data.userId = user._id;
      socket.data.user = {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      };
      return next();
    } catch {
      return next(new Error("Token không hợp lệ"));
    }
  });

  io.on("connection", (socket) => {
    const userId = String(socket.data.userId);
    socket.join(`user:${userId}`);

    console.log(
      `[socket] user ${userId} (${socket.data.user?.username}) — ${socket.id}`,
    );

    socket.on("disconnect", (reason) => {
      console.log(`[socket] user ${userId} ngắt — ${reason}`);
    });
  });
}

module.exports = { setupSocketIO };

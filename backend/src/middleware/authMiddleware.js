const jwt = require("jsonwebtoken");
const User = require("../model/User");

const protect = async (req, res, next) => {
  let token;
  const secretKey = process.env.SECRET_KEY;

  // Kiểm tra xem Token có nằm trong Header "Authorization" và bắt đầu bằng "Bearer" không
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Lấy Token từ chuỗi "Bearer <token>"
      token = req.headers.authorization.split(" ")[1];

      // Giải mã token
      const decoded = jwt.verify(token, secretKey);

      const userId = decoded.id || decoded._id;

      // Tìm user trong DB và lưu thông tin user vào đối tượng req
      req.user = await User.findById(userId).select("-password");

      // Kiểm tra xem User còn tồn tại trong DB không
      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Tài khoản này không còn tồn tại trong hệ thống!" });
      }

      return next();
    } catch (error) {
      res
        .status(401)
        .json({ message: "Không có quyền truy cập, token không hợp lệ" });
    }
  }
  if (!token) {
    res.status(401).json({ message: "Không có quyền truy cập, thiếu token" });
  }
};

module.exports = { protect };

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
      console.log(decoded);

      // Tìm user trong DB và lưu thông tin user vào đối tượng req
      req.user = await User.findById(decoded.id);

      next();
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

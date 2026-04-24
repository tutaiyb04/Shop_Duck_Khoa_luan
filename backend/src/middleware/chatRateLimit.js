const rateLimit = require("express-rate-limit");

function userKey(req) {
  const u = req.user?._id || req.user?.id;
  return u ? `uid:${String(u)}` : `ip:${req.ip || "unknown"}`;
}

/** Gửi tin + JSON — theo user đã đăng nhập. */
const chatMessageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.CHAT_MSG_RATE_MAX || 120),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userKey,
  message: "Bạn gửi tin quá nhanh, vui lòng thử lại sau.",
});

/** Upload ảnh lên Cloudinary — nặng hơn, giới hạn chặt hơn. */
const chatUploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.CHAT_UPLOAD_RATE_MAX || 40),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userKey,
  message: "Tải ảnh quá nhanh, vui lòng thử lại sau.",
});

module.exports = { chatMessageLimiter, chatUploadLimiter };

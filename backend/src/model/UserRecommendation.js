const mongoose = require("mongoose");

const userRecommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    products: {
      // Lưu nguyên shape sản phẩm để API trả về luôn không cần lookup
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    source: {
      type: String,
      enum: ["cf", "cbf", "hybrid", "trending", "empty"],
      default: "cf",
    },
    seedCount: { type: Number, default: 0 },
    similarUsersCount: { type: Number, default: 0 },
    computedAt: { type: Date, default: Date.now },
    // Mongo TTL — document tự bị xoá sau khi quá hạn (≥60s độ trễ).
    // Cron nên ghi đè trước khi tới hạn để giữ cache "ấm".
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

userRecommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model(
  "UserRecommendation",
  userRecommendationSchema,
);

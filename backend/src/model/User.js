const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return this.authType === "local";
      },
      select: false,
    },
    authType: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    avatar: {
      type: String,
      default: "https://via.placeholder.com/150",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // Thông tin người bán
    sellerProfile: {
      isVerified: { type: Boolean, default: false }, // Xác minh danh tính người bán (uy tín)
      storeName: { type: String },
      description: { type: String },
      balance: { type: Number, default: 0 }, // Tiền bán hàng tạm giữ
    },
    // Thông tin người mua
    buyerProfile: {
      shippingAddresses: [String],
      wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    },
    rating: {
      type: Number,
      default: 5,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "locked"],
      default: "active",
    },
    reportCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ emailVerificationToken: 1 });

// mã hóa mật khẩu trước khi lưu
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("User", userSchema);

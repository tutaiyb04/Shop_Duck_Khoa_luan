const dotenv = require("dotenv");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

dotenv.config();

// Cấu hình bằng thông số lấy từ Dashboard của Cloudinary (Nên đưa vào file .env)
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY_CLOUD,
  api_secret: process.env.API_SECRET_CLOUD,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "duck_shop_folder", // Tên thư mục trên cloudinary
    allowed_formats: ["jpg", "jpeg", "png"], // Chỉ cho phép ảnh
    transformation: [{ width: 500, height: 500, crop: "limit" }], // Tự động resize ảnh cho nhẹ hơn
  },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };

const dotenv = require("dotenv");
const { Readable } = require("stream");
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
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    transformation: [{ width: 500, height: 500, crop: "limit" }], // Tự động resize ảnh cho nhẹ hơn
  },
});

const upload = multer({ storage: storage });


// Upload một buffer ảnh lên Cloudinary (dùng cho sản phẩm: upload song song).
// Không áp transformation lúc upload — ảnh đã được nén phía client; giảm thời gian chờ.

function uploadProductImageBuffer(buffer) {
  return new Promise((resolve, reject) => {
    
    // Kiểm tra nếu buffer rỗng
    if (!buffer || buffer.length === 0) {
      reject(new Error("Dữ liệu ảnh rỗng"));
      return;
    }
    
    // Tạo stream upload
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "duck_shop_folder",
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      },
    );

    // Pipe buffer vào stream upload
    Readable.from(buffer).pipe(uploadStream);
  });
}

// Upload hàng loạt buffer ảnh lên Cloudinary (dùng cho sản phẩm: upload song song).
async function uploadProductImageBuffers(files) {
  // Kiểm tra nếu files không phải là mảng hoặc mảng rỗng
  if (!Array.isArray(files) || files.length === 0) return [];

  // Chạy tải lên song song (Batch Upload)
  return Promise.all(files.map((f) => uploadProductImageBuffer(f.buffer)));
}

module.exports = {
  cloudinary,
  upload,
  uploadProductImageBuffer,
  uploadProductImageBuffers,
};

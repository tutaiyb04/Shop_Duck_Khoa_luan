const multer = require("multer");
const { upload } = require("../config/cloudinary");

// bộ lọc định dạng ảnh
const imageMime = /^image\/(jpeg|jpg|pjpeg|png|webp|gif)$/i;

// tải ảnh vào RAM → service upload song song lên Cloudinary (nhanh hơn multer-storage tuần tự)
const productImagesMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    if (imageMime.test(file.mimetype)) cb(null, true);
    else cb(new Error("Chỉ chấp nhận ảnh JPG, PNG, WebP hoặc GIF."));
  },
});

// lưu tạm ảnh vào RAM dưới dạng buffer
exports.uploadProductImagesMemory = (fieldName, maxCount) => {
  return (req, res, next) => {
    productImagesMemory.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        console.error(`Upload ảnh (${fieldName}):`, err);
        return res.status(400).json({
          message:
            err.message ||
            "Không tải được ảnh — kiểm tra định dạng hoặc dung lượng tối đa 5MB/ảnh.",
        });
      }
      next();
    });
  };
};

// tải ảnh trực tiếp lên
exports.uploadProductImages = (fieldName, maxCount) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        console.error(`Upload ảnh (${fieldName}):`, err);
        return res.status(400).json({
          message:
            err.message ||
            "Không tải được ảnh lên, vui lòng kiểm tra lại định dạng hoặc dung lượng.",
        });
      }
      next();
    });
  };
};

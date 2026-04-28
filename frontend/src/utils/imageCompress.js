// Giảm kích thước ảnh trên trình duyệt trước khi multipart lên server → Cloudinary

// Bộ lọc định dạng
const COMPRESSIBLE = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

function outputName(originalName, mime) {
  const base = originalName.replace(/\.[^.]+$/, "") || "image";
  if (mime === "image/webp") return `${base}.webp`;
  return `${base}.jpg`;
}

// thiết lập thông số và xử lý ảnh  
export async function compressImageFile(file, options = {}) {
  const {
    maxEdge = 1920,
    quality = 0.84,
    skipIfUnderBytes = 380 * 1024,
  } = options;

  // Kiểm tra nếu ảnh không phải là ảnh hoặc không phải là định dạng có thể compress
  if (!file?.type?.startsWith("image/") || !COMPRESSIBLE.has(file.type)) {
    return file;
  }
  
  // Tạo bitmap từ ảnh
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  // Tính toán kích thước mới của ảnh
  const { width, height } = bitmap;
  const scale = Math.min(1, maxEdge / width, maxEdge / height);
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));

  // Kiểm tra nếu ảnh đã đủ nhỏ thì không cần resize
  const noResizeNeeded = scale >= 1;
  if (noResizeNeeded && file.size < skipIfUnderBytes) {
    bitmap.close();
    return file;
  }

  // Tạo canvas để resize ảnh
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const mime = file.type === "image/webp" ? "image/webp" : "image/jpeg";

  // nếu file mới nén vẫn lớn hơn 92% kích thước cũ thì lấy luôn file gốc
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob || blob.size >= file.size * 0.92) {
          resolve(file);
          return;
        }

        resolve(
          new File([blob], outputName(file.name, mime), { type: mime }),
        );
      },
      mime,
      quality,
    );
  });
}

// Xử lý hàng loạt (Batch Processing)
export async function compressImageFiles(files) {
  return Promise.all(files.map((f) => compressImageFile(f)));
}

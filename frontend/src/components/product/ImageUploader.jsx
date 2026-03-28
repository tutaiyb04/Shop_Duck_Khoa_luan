import React from "react";
import { X, Plus, Image as ImageIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

function ImageUploader({
  images,
  imageError,
  fileInputRef,
  handleFileChange,
  removeImage,
  maxImages,
  maxFileSizeMB,
}) {
  return (
    <div className="mb-8 p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
      <div className="flex items-center justify-between mb-4">
        <label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-amber-500" />
          Hình ảnh sản phẩm <span className="text-red-500">*</span>
        </label>
        <span className="text-sm text-gray-500">
          ({images.length} / {maxImages} ảnh) - Tối đa {maxFileSizeMB}MB/ảnh
        </span>
      </div>

      {/* Hiển thị lỗi liên quan đến ảnh (nếu có) */}
      {imageError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{imageError}</AlertDescription>
        </Alert>
      )}

      {/* Khu vực Grid hiển thị ảnh Preview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {/* Ô NÚT BẤM "THÊM ẢNH" */}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="group aspect-square flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white hover:border-amber-400 hover:bg-amber-50/50 transition-all text-gray-500 hover:text-amber-600"
          >
            <Plus className="w-8 h-8 " />
            <span className="text-xs font-medium">Thêm ảnh</span>
          </button>
        )}

        {/* HIỂN THỊ CÁC ẢNH ĐÃ CHỌN (PREVIEW) */}
        {images.map((image, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white group shadow-sm"
          >
            <img
              src={image.preview}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Nút xóa ảnh */}
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Ô INPUT FILE ẨN */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/png, image/jpeg, image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

export default ImageUploader;

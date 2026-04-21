import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  ShieldAlert,
  Share2,
  Heart,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

function ProductGallery({
  product,
  activeImage,
  setActiveImage,
  handlePrevImage,
  handleNextImage,
  setIsReportModalOpen,
  isLiked,
  isLiking,
  handleToggleLike,
  handleShare,
}) {
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="aspect-[4/3] sm:aspect-[3/4] md:aspect-square bg-gray-50 flex items-center justify-center relative mb-4 rounded-lg overflow-hidden border border-gray-100">
        <img
          src={product.images[activeImage]}
          className="max-w-full max-h-full object-contain mix-blend-multiply"
          alt={product.name}
        />
        <button
          onClick={() => setIsGalleryModalOpen(true)}
          className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 !bg-black/60 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-md flex items-center gap-2 text-xs sm:text-sm hover:bg-black/80 transition-colors cursor-pointer !border-0 !ring-0 !outline-none"
        >
          <ImageIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Xem tất cả ảnh</span>
          <span className="sm:hidden">({product.images.length})</span>
        </button>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 w-full relative z-10">
        <button
          onClick={handlePrevImage}
          className="p-1 sm:p-2 cursor-pointer !border-0 !ring-0 !outline-none !bg-transparent hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 !text-black" />
        </button>

        <div className="flex gap-2 overflow-x-auto flex-1 justify-start scrollbar-hide py-1">
          {product.images.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(index)}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded overflow-hidden shrink-0 !transition-all hover:scale-105 cursor-pointer !border !ring-0 !outline-none ${
                activeImage === index
                  ? "!border-yellow-600 shadow-sm opacity-100"
                  : "!border-gray-200 hover:!border-yellow-400 opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                className="w-full h-full object-cover"
                alt={`thumbnail-${index}`}
              />
            </button>
          ))}
        </div>

        <button
          onClick={handleNextImage}
          className="p-1 sm:p-2 cursor-pointer !border-0 !ring-0 !outline-none !bg-transparent hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 !text-black" />
        </button>
      </div>

      <div className="flex flex-wrap md:flex-nowrap items-center justify-between mt-4 sm:mt-6 pt-4 border-t border-gray-100 text-sm text-gray-500 relative z-20 gap-y-3 gap-x-4">
        <div className="flex items-center whitespace-nowrap">
          <span className="mr-1">Bạn có sản phẩm muốn bán?</span>
          <NavLink
            to="/sell"
            className="!text-yellow-600 font-medium hover:!underline p-0 whitespace-nowrap"
          >
            Đăng bán
          </NavLink>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 relative z-30 shrink-0">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1 hover:text-yellow-600 p-0 whitespace-nowrap cursor-pointer !border-0 !ring-0 !outline-none !bg-transparent !transition-all"
          >
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" /> Báo cáo
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 hover:text-yellow-600 p-0 whitespace-nowrap cursor-pointer !border-0 !ring-0 !outline-none !bg-transparent !transition-all"
          >
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5" /> Chia sẻ
          </button>
          <button
            onClick={handleToggleLike}
            disabled={isLiking}
            className={`flex items-center gap-1 p-0 whitespace-nowrap cursor-pointer !border-0 !ring-0 !outline-none !bg-transparent ${
              isLiked
                ? "text-red-500 hover:text-red-600 !transition-all"
                : "hover:text-yellow-600 text-gray-500 !transition-all"
            }`}
          >
            <Heart
              className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? "fill-current" : ""}`}
            />
            {isLiked ? "Đã yêu thích" : "Yêu thích"}
          </button>
        </div>
      </div>

      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col">
          <div className="flex items-center justify-between p-4 text-white border-b border-gray-800">
            <h3 className="text-lg font-medium">
              Tất cả hình ảnh ({product.images.length})
            </h3>
            <button
              onClick={() => setIsGalleryModalOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer !border-0 !outline-none"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {product.images.map((img, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer group"
                  onClick={() => {
                    setActiveImage(index);
                    setIsGalleryModalOpen(false);
                  }}
                >
                  <img
                    src={img}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    alt={`gallery-img-${index}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductGallery;

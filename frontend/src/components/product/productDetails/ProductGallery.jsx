import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  ShieldAlert,
  Share2,
  Heart,
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
  return (
    <div className="lg:col-span-5 flex flex-col">
      <div className="aspect-[3/4] md:aspect-square bg-gray-50 flex items-center justify-center relative mb-4">
        <img
          src={product.images[activeImage]}
          className="max-w-full max-h-full object-contain mix-blend-multiply"
          alt={product.name}
        />
        <button className="absolute bottom-4 left-4 !bg-black/60 text-white px-3 py-2 rounded-md flex items-center gap-2 text-sm hover:bg-black/80 transition-colors cursor-pointer !border-0 !ring-0 !outline-none">
          <ImageIcon className="w-4 h-4" /> Xem tất cả ảnh
        </button>
      </div>

      <div className="flex items-center gap-2 w-full relative z-10">
        <button
          onClick={handlePrevImage}
          className="p-1 cursor-pointer !border-0 !ring-0 !outline-none !bg-transparent"
        >
          <ChevronLeft className="w-6 h-6 !text-black" />
        </button>

        <div className="flex gap-2 overflow-hidden flex-1 justify-start">
          {product.images.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(index)}
              className={`w-16 h-16 rounded overflow-hidden shrink-0 !transition-all hover:scale-105 hover:!border-0 cursor-pointer !border !ring-0 !outline-none ${
                activeImage === index
                  ? "!border-yellow-800 shadow-sm"
                  : "!border-yellow-200 hover:!border-yellow-300 opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                className="w-full h-full object-cover"
                alt="thumbnail"
              />
            </button>
          ))}
        </div>

        <button
          onClick={handleNextImage}
          className="p-1 cursor-pointer !border-0 !ring-0 !outline-none !bg-transparent"
        >
          <ChevronRight className="w-6 h-6 !text-black" />
        </button>
      </div>

      {/* Phần nút chức năng được đưa z-index lên cao */}
      <div className="flex items-start justify-between mt-6 pt-4 text-sm text-gray-500 relative z-20">
        <div className="mr-3">
          <div className="whitespace-nowrap">Bạn có sản phẩm muốn bán? </div>
          <NavLink
            to="/sell"
            className="!text-yellow-600 font-medium hover:!underline p-0 whitespace-nowrap"
          >
            Đăng bán
          </NavLink>
        </div>
        <div className="flex items-center gap-4 relative z-30">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1 hover:text-yellow-500 p-0 whitespace-nowrap cursor-pointer !border-0 !ring-0 !outline-none !bg-transparent !transition-all"
          >
            <ShieldAlert className="w-5 h-5" /> Báo cáo
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 hover:text-yellow-500 p-0 whitespace-nowrap cursor-pointer !border-0 !ring-0 !outline-none !bg-transparent !transition-all"
          >
            <Share2 className="w-5 h-5" /> Chia sẻ
          </button>
          <button
            onClick={handleToggleLike}
            disabled={isLiking}
            className={`flex items-center gap-1 p-0 whitespace-nowrap cursor-pointer !border-0 !ring-0 !outline-none !bg-transparent ${
              isLiked
                ? "text-red-500 hover:text-red-600 !transition-all"
                : "hover:text-yellow-500 text-gray-500 !transition-all"
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            {isLiked ? "Đã yêu thích" : "Yêu thích"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductGallery;

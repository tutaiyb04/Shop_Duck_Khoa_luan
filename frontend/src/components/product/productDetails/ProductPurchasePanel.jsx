import { Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

function ProductPurchasePanel({
  product,
  buyQuantity,
  maxQuantity,
  handleDecrease,
  handleIncrease,
}) {
  return (
    <div className="flex flex-col h-full w-full lg:pl-4 xl:pl-6">
      {/* 1. TÊN & GIÁ SẢN PHẨM: Nhỏ lại một chút trên mobile */}
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 leading-snug mb-2 sm:mb-4 break-words">
        {product.name}
      </h1>
      <p className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-6 sm:mb-8">
        {product.price.toLocaleString("vi-VN")}đ
      </p>

      {/* 2. CHỌN SỐ LƯỢNG: Thêm flex-wrap để tránh bị tràn ngang */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-8 mb-6 sm:mb-8">
        <span className="text-sm text-gray-500 w-20 sm:w-auto shrink-0">
          Số lượng:
        </span>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white shrink-0">
            <button
              onClick={handleDecrease}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 !transition-colors !border-0 !ring-0 !outline-none disabled:opacity-50 cursor-pointer"
              disabled={buyQuantity <= 1}
            >
              -
            </button>

            {/* Đã chuyển viền phân cách vào input cho đồng bộ */}
            <input
              type="text"
              value={buyQuantity}
              readOnly
              className="w-10 sm:w-12 h-8 sm:h-9 text-center text-sm outline-none text-gray-800 border-x border-gray-300"
            />

            <button
              onClick={handleIncrease}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 !border-0 !ring-0 !outline-none !transition-colors disabled:opacity-50 cursor-pointer"
              disabled={buyQuantity >= maxQuantity}
            >
              +
            </button>
          </div>

          <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
            {maxQuantity} sản phẩm có sẵn
          </span>
        </div>
      </div>

      {/* 3. CÁC NÚT MUA HÀNG: Xếp dọc trên mobile, ngang trên tablet/PC */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Button
          variant="outline"
          className="flex-1 h-11 sm:h-12 text-sm sm:text-base font-medium !border-yellow-600 !text-yellow-600 hover:!bg-yellow-50 hover:!text-yellow-700 !bg-white cursor-pointer !transition-colors"
        >
          Thêm vào giỏ hàng
        </Button>
        <Button className="flex-1 h-11 sm:h-12 text-sm sm:text-base font-medium !bg-yellow-600 hover:!bg-yellow-700 text-white shadow-sm cursor-pointer !border-0 !ring-0 !outline-none !transition-colors">
          Mua ngay
        </Button>
      </div>

      {/* 4. CAM KẾT: Đã sửa lỗi typo text-4sm thành text-xs sm:text-sm */}
      <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t border-gray-100">
        <div className="flex items-start gap-3">
          <div className="bg-green-100 text-green-600 rounded-full p-1 mt-0.5 shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Duck Shop cam kết nhận sản phẩm như mô tả hoặc nhận tiền hoàn. Mọi
            thông tin thanh toán của bạn được bảo mật tuyệt đối.
          </p>
        </div>

        <div className="flex items-start gap-3">
          <div className="bg-green-100 text-green-600 rounded-full p-1 mt-0.5 shrink-0">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Duck Shop - Nền tảng mua bán đồ cũ!
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProductPurchasePanel;

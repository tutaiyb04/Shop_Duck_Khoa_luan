import { Check, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

function ProductPurchasePanel({ product, maxQuantity }) {
  const navigate = useNavigate();

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
          <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
            {maxQuantity} sản phẩm
          </span>
        </div>
      </div>

      {/* 3. CÁC NÚT MUA HÀNG: Xếp dọc trên mobile, ngang trên tablet/PC */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Button
          type="button"
          className="flex-1 h-11 sm:h-12 text-sm sm:text-base font-medium !bg-yellow-600 hover:!bg-yellow-700 text-white shadow-sm cursor-pointer !border-0 !ring-0 !outline-none !transition-colors"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate("/messages");
          }}
        >
          Chat với người bán để mua
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

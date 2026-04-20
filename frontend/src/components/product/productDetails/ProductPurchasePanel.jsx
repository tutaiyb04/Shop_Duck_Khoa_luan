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
    <div className="lg:col-span-7 flex flex-col pl-0 lg:pl-4">
      <h1 className="text-2xl font-bold text-gray-800 leading-snug mb-4">
        {product.name}
      </h1>
      <p className="text-3xl font-bold text-yellow-600 mb-8">
        {product.price.toLocaleString("vi-VN")}đ
      </p>

      <div className="flex items-center gap-8 mb-8">
        <span className="text-4sm text-gray-500 min-w-[5rem]">Số lượng:</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white">
            <button
              onClick={handleDecrease}
              className="w-8 h-8 flex items-center justify-center text-gray-600 border-r border-gray-300 !transition-colors !border-0 !ring-0 !outline-none disabled:opacity-50 cursor-pointer"
              disabled={buyQuantity <= 1}
            >
              -
            </button>
            <input
              type="text"
              value={buyQuantity}
              readOnly
              className="w-12 h-8 text-center text-sm outline-none text-gray-800"
            />
            <button
              onClick={handleIncrease}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 !border-0 !ring-0 !outline-none !transition-colors disabled:opacity-50 cursor-pointer"
              disabled={buyQuantity >= maxQuantity}
            >
              +
            </button>
          </div>
          <span className="text-4sm text-gray-500">
            {maxQuantity} sản phẩm có sẵn
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Button
          variant="outline"
          className="h-12 text-base font-medium !border-yellow-500 !text-yellow-500 !border-yellow-50 hover:!text-yellow-600 !border-yellow-500 rounded-md !bg-white cursor-pointer !border-1 !ring-0 !outline-none !transition-all"
        >
          Thêm vào giỏ hàng
        </Button>
        <Button className="h-12 text-base font-medium !bg-yellow-500 !border-yellow-500 hover:!bg-yellow-600 text-white rounded-md shadow-sm cursor-pointer !border-0 !ring-0 !outline-none !transition-all">
          Mua ngay
        </Button>
      </div>

      <div className="space-y-4 pt-6 border-t border-gray-100">
        <div className="flex items-start gap-3">
          <div className="bg-green-100 text-green-600 rounded-full p-1 mt-0.5 shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <p className="text-4sm text-gray-600 leading-relaxed">
            Duck Shop cam kết nhận sản phẩm như mô tả hoặc nhận tiền hoàn. Mọi
            thông tin thanh toán của bạn được bảo mật tuyệt đối.
          </p>
        </div>

        <div className="flex items-start gap-3">
          <div className="bg-green-100 text-green-600 rounded-full p-1 mt-0.5 shrink-0">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <p className="text-4sm text-gray-600 leading-relaxed">
            Duck Shop - Nền tảng mua bán đồ cũ!
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProductPurchasePanel;

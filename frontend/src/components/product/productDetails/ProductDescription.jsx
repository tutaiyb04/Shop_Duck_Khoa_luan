import { Card, CardContent } from "@/components/ui/card";

function ProductDescription({ product }) {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Thông tin nổi bật */}
      <Card className="border shadow-sm bg-white overflow-hidden rounded-xl">
        <CardContent className="p-4 sm:p-6 md:px-8 lg:px-10 py-5 sm:py-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
            Thông tin nổi bật
          </h2>

          <div className="flex flex-col text-sm sm:text-base text-gray-700">
            <div className="flex py-2.5 sm:py-3 border-b border-gray-100 items-start sm:items-center">
              <span className="w-2/5 sm:w-1/3 text-gray-500 shrink-0">
                Danh mục
              </span>
              <span className="w-3/5 sm:w-2/3 text-yellow-600 cursor-pointer hover:underline break-words">
                {product.category?.name || "Danh mục"}
              </span>
            </div>

            <div className="flex py-2.5 sm:py-3 border-b border-gray-100 items-start sm:items-center">
              <span className="w-2/5 sm:w-1/3 text-gray-500 shrink-0">
                Tình trạng
              </span>
              <span className="w-3/5 sm:w-2/3 break-words">
                {product.condition || "Đã sử dụng - Tốt"}
              </span>
            </div>

            <div className="flex py-3 items-center">
              <span className="w-1/3 text-gray-500 font-medium">
                Kích thước
              </span>
              <span className="w-2/3">
                {product.attributes?.size || "Đang cập nhật"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mô tả sản phẩm */}
      <Card className="border shadow-sm bg-white overflow-hidden rounded-xl">
        <CardContent className="p-4 sm:p-6 md:px-8 lg:px-10 py-5 sm:py-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
            Mô tả sản phẩm
          </h2>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm sm:text-base break-words">
            {product.description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProductDescription;

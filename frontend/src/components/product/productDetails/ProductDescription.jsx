import { Card, CardContent } from "@/components/ui/card";

function ProductDescription({ product }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Thông tin nổi bật */}
      <Card className="border shadow-sm bg-white overflow-hidden rounded-xl">
        <CardContent className="px-10 py-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Thông tin nổi bật
          </h2>
          <div className="flex flex-col text-sm text-gray-700">
            <div className="flex py-3 border-b border-gray-100 items-center">
              <span className="w-1/3 text-gray-500">Danh mục</span>
              <span className="w-2/3 text-yellow-600 cursor-pointer hover:underline">
                {product.category?.name || "Danh mục"}
              </span>
            </div>
            <div className="flex py-3 border-b border-gray-100 items-center">
              <span className="w-1/3 text-gray-500">Tình trạng</span>
              <span className="w-2/3">
                {product.condition || "Đã sử dụng - Tốt"}
              </span>
            </div>
            <div className="flex py-3 items-center">
              <span className="w-1/3 text-gray-500">Kích thước</span>
              <span className="w-2/3">
                {product.attributes?.size || "Đang cập nhật"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mô tả sản phẩm */}
      <Card className="border shadow-sm bg-white overflow-hidden rounded-xl">
        <CardContent className="px-10 py-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Mô tả sản phẩm
          </h2>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm">
            {product.description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProductDescription;

import UserAvatar from "../shared/UserAvatar";
import { Card, CardContent, CardFooter } from "../ui/card";

function ProductCard({ product }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all cursor-pointer border shadow-sm bg-white flex flex-col h-full group">
      {/* Ảnh sản phẩm */}
      <div className="aspect-square overflow-hidden bg-gray-50 relative">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
          {product.condition}
        </div>
      </div>

      {/* Thông tin chính */}
      <CardContent className="p-3 flex-1">
        <h3 className="font-medium text-gray-800 line-clamp-2 text-sm leading-tight min-h-[2.5rem]">
          {product.name}
        </h3>
        <p className="text-amber-600 font-bold text-base mt-2">
          {formatPrice(product.price)}
        </p>
      </CardContent>

      {/* Thông tin người bán */}
      <CardFooter className="p-3 pt-0 flex items-center gap-2 border-t mt-auto border-gray-50">
        <UserAvatar user={product.sellerId} className="h-5 w-5 border" />
        <span className="text-[11px] text-gray-500 truncate">
          {product.sellerId?.username || "Người bán ẩn danh"}
        </span>
      </CardFooter>
    </Card>
  );
}

export default ProductCard;

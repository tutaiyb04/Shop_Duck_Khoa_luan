import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { MapPin } from "lucide-react";

function ProductCard({ product }) {
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <Card
      className="w-full h-full py-0 overflow-hidden hover:shadow-lg transition-all cursor-pointer border shadow-sm bg-white flex flex-col group"
      onClick={() => navigate(`/product/${product._id}`)}
    >
      {/* Ảnh sản phẩm */}
      <div className="aspect-square w-full overflow-hidden bg-gray-50 relative border-b border-gray-100">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 bg-black/60 text-white text-s font-bold px-2 py-1 rounded backdrop-blur-sm">
          {product.condition}
        </div>
      </div>

      {/* Thông tin chính */}
      <CardContent className="p-2 flex flex-col flex-1 justify-between">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug group-hover:text-yellow-600 transition-colors">
          {product.name}
        </h3>
        <p className="mt-1 text-black font-bold text-base">
          {formatPrice(product.price)}
        </p>

        <div className="mt-auto pt-2 flex flex-col gap-0.5 border-t border-gray-50">
          {typeof product.distance === "number" && (
            <span className="text-[11px] font-medium text-yellow-700">
              Cách bạn ~{(product.distance / 1000).toFixed(1)} km
            </span>
          )}
          <div className="flex items-center gap-1 text-gray-400">
            <MapPin size={12} className="shrink-0" />
            <span className="text-[11px] truncate">
              {product.address || "Hà Nội"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductCard;

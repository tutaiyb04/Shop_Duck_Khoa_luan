import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon, MapPin } from "lucide-react";
import { NavLink } from "react-router-dom";

function RelatedProducts() {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Sản phẩm liên quan</h2>
        <NavLink to="#" className="text-blue-500 text-sm hover:underline">
          Xem tất cả
        </NavLink>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Dữ liệu cứng tạm thời */}
        {[1, 2, 3, 4].map((item) => (
          <Card
            key={item}
            className="border border-gray-100 shadow-sm bg-white overflow-hidden rounded-xl hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group p-0"
          >
            <div className="aspect-[3/4] bg-gray-50 relative overflow-hidden flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-gray-200 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <CardContent className="p-3">
              <h3 className="text-[13px] text-gray-800 line-clamp-2 min-h-[39px] mb-2 group-hover:text-yellow-600">
                Tên sản phẩm mẫu {item}
              </h3>
              <p className="text-sm font-bold text-gray-800 mb-3">150.000đ</p>
              <div className="flex items-center gap-1 text-[11px] text-gray-500">
                <MapPin className="w-3.5 h-3.5" />
                <span>Hà Nội</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default RelatedProducts;

import ProductCard from "@/components/product/ProductCard";
import UserSidebar from "@/components/shared/UserSidebar";
import { Card, CardContent } from "@/components/ui/card";
import useWishlist from "@/hooks/productHooks/useWishlist";
import { Heart, Search } from "lucide-react";

function Wishlist() {
  const { loading, searchTerm, filteredList, setSearchTerm } = useWishlist();

  return (
    <div className="max-w-6xl mx-auto px-4 py-20 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <UserSidebar />
        </div>

        <div className="md:col-span-3 space-y-6">
          {/* CARD TIÊU ĐỀ & TÌM KIẾM */}
          <Card className="border border-gray-100 shadow-sm rounded-xl bg-white overflow-hidden">
            <CardContent className="p-6">
              {/* Tiêu đề và Ô tìm kiếm */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Yêu thích
                </h1>

                <div className="relative w-full sm:w-72 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-yellow-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm trong danh mục đã lưu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all"
                  />
                </div>
              </div>

              {/* Số sản phẩm (Nằm dưới theo yêu cầu) */}
              <div className="mt-6 pt-4 border-t border-gray-50">
                <p className="text-gray-500 text-sm font-medium">
                  Có{" "}
                  <span className="text-yellow-600 font-bold">
                    {filteredList.length}
                  </span>{" "}
                  tin đăng bạn đã lưu
                </p>
              </div>
            </CardContent>
          </Card>

          {/* KHU VỰC HIỂN THỊ SẢN PHẨM (Hiển thị riêng lẻ từng khối) */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 font-medium">
                Đang tải danh sách yêu thích...
              </p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="bg-white py-20 rounded-xl border border-dashed border-gray-200 text-center flex flex-col items-center">
              <Heart className="w-16 h-16 text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium text-lg">
                {searchTerm
                  ? `Không tìm thấy kết quả cho "${searchTerm}"`
                  : "Danh sách yêu thích đang trống."}
              </p>
            </div>
          ) : (
            /* Danh sách sản phẩm hiển thị riêng lẻ, rộng bằng Card tiêu đề */
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredList.map((item) => (
                <div
                  key={item._id}
                  className="transition-transform hover:-translate-y-1"
                >
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Wishlist;

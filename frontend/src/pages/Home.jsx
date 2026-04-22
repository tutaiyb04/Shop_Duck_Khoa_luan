import React from "react";
import { useGetProduct } from "@/hooks/productHooks/useGetProduct";
import ProductCard from "@/components/product/ProductCard";

function Home() {
  const { products, isLoading, activeSearch, hasLocationFilter } =
    useGetProduct();

  const isFiltered = Boolean(activeSearch || hasLocationFilter);

  let sectionTitle = "Sản phẩm mới đăng";
  if (activeSearch && hasLocationFilter) {
    sectionTitle = `Kết quả “${activeSearch}” gần bạn`;
  } else if (activeSearch) {
    sectionTitle = `Kết quả cho “${activeSearch}”`;
  } else if (hasLocationFilter) {
    sectionTitle = "Sản phẩm gần bạn";
  }

  let emptyMessage = "Chưa có sản phẩm nào được rao bán.";
  if (isFiltered) {
    emptyMessage = activeSearch
      ? `Không tìm thấy sản phẩm phù hợp với “${activeSearch}”.`
      : "Không có sản phẩm nào trong bán kính đã chọn.";
  }

  return (
    <div className="min-h-screen bg-amber-50 w-full pb-10 sm:pb-20">
      {/* Banner Duck Shop */}
      <div className="bg-amber-50 w-full py-8 sm:py-10 px-4 flex flex-col items-center justify-center">
        <div className="max-w-2xl text-center space-y-2 sm:space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Duck Shop 🦆
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Nền tảng mua bán đồ cũ thông minh.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 mt-4 sm:mt-8 max-w-7xl">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 pl-2 sm:pl-0">
          {sectionTitle}
        </h2>

        {isLoading ? (
          <div className="text-center py-10 sm:py-20 text-gray-400 animate-pulse text-sm sm:text-base">
            Đang tải sản phẩm...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-10 sm:py-20 bg-white rounded-xl border border-dashed text-gray-400 mx-2 sm:mx-0 text-sm sm:text-base">
            {emptyMessage}
          </div>
        ) : (
          /* Tối ưu Gap trên Mobile: dùng gap-2 hoặc gap-3 thay vì gap-4 */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 px-1 sm:px-0">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;

import React from "react";
import { useGetProduct } from "@/hooks/productHooks/useGetProduct";
import ProductCard from "@/components/product/ProductCard";

function Home() {
  const { products, isLoading } = useGetProduct();


  return (
    <div className="min-h-screen bg-amber-50 w-full pb-20">
      {/* Banner Duck Shop */}
      <div className="bg-amber-50 w-full py-10 px-6 flex flex-col items-center justify-center">
        <div className="max-w-2xl text-center space-y-3">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Duck Shop 🦆
          </h1>
          <p className="text-gray-600">Nền tảng mua bán đồ cũ thông minh.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 max-w-7xl">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Sản phẩm mới đăng
        </h2>

        {isLoading ? (
          <div className="text-center py-20 text-gray-400 animate-pulse">
            Đang tải sản phẩm...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed text-gray-400">
            Chưa có sản phẩm nào được rao bán.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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

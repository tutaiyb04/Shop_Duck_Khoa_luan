import { NavLink } from "react-router-dom";
import ProductCard from "../ProductCard";

function RelatedProducts({ products }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Sản phẩm liên quan</h2>
        <NavLink to="#" className="text-blue-500 text-sm hover:underline">
          Xem tất cả
        </NavLink>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((item) => (
          <ProductCard key={item._id} product={item} />
        ))}
      </div>
    </div>
  );
}

export default RelatedProducts;

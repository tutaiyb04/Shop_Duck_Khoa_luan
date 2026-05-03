import { NavLink } from "react-router-dom";
import ProductCard from "../ProductCard";

function RelatedProducts({ products, categoryId }) {
  if (!products || products.length === 0) return null;

  // định vị link "Xem tất cả" theo danh mục phụ của tin đang xem
  const cid =
    categoryId != null ? String(categoryId).trim() : "";
  const viewAllHref = cid
    ? `/products?category=${encodeURIComponent(cid)}`
    : "/products";

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Sản phẩm liên quan</h2>
        <NavLink
          to={viewAllHref}
          className="!text-yellow-600 text-sm !transition-colors hover:!text-yellow-700"
        >
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

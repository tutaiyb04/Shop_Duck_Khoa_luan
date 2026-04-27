import { NavLink } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import HomeProductGrid from "./HomeProductGrid";

export default function HomeCategoryRows({ rows }) {
  if (rows.length === 0) return null;

  return (
    <div className="space-y-10">
      {rows.map((row) => (
        <section
          key={row._id}
          aria-labelledby={`cat-${row._id}`}
          className="scroll-mt-4"
        >
          <div className="mb-4 flex items-end justify-between gap-2 pl-1 sm:pl-0">
            <h2
              id={`cat-${row._id}`}
              className="text-xl font-bold text-gray-900 sm:text-2xl"
            >
              {row.name}
            </h2>
            <NavLink
              to={`/products?category=${row._id}`}
              className="inline-flex items-center gap-0.5 text-sm font-medium !text-amber-700 hover:!underline"
            >
              Xem tất cả
              <ChevronRight className="h-4 w-4" />
            </NavLink>
          </div>
          {row.products.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Chưa có sản phẩm trong danh mục này.
            </p>
          ) : (
            <HomeProductGrid products={row.products} />
          )}
        </section>
      ))}
    </div>
  );
}

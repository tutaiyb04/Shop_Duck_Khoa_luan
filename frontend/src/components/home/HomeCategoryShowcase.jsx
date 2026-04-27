import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  BookOpen,
  Shirt,
  Sparkles,
  Smartphone,
  Home,
  Baby,
  Gamepad2,
  Car,
  Footprints,
  Dog,
  Watch,
  Music,
  Camera,
  Dumbbell,
  Briefcase,
  Flower2,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, memo } from "react";
import { iconForCategoryName } from "@/utils/categoryHelper";
import LoadingBlock from "@/components/shared/LoadingBlock";

const CategoryTile = memo(({ to, label, active, Icon }) => {
  return (
    <NavLink
      to={to}
      className={cn(
        "group flex flex-col items-center gap-2 rounded-2xl border border-transparent bg-amber-50/60 px-2 py-4 text-center transition-all hover:border-amber-200 hover:bg-amber-100/80 hover:shadow-sm sm:px-3",
        active && "border-amber-400 bg-amber-100 shadow-md ring-2 ring-amber-300/50",
      )}
    >
      <span
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full bg-white text-amber-700 shadow-sm ring-1 ring-amber-100 transition-transform group-hover:scale-105 sm:h-14 sm:w-14",
          active && "bg-amber-500 text-white ring-amber-400",
        )}
        aria-hidden
      >
        <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.75} />
      </span>
      <span className="line-clamp-2 text-xs font-semibold text-gray-800 sm:text-sm">
        {label}
      </span>
    </NavLink>
  );
});
CategoryTile.displayName = "CategoryTile";

export default function HomeCategoryShowcase({
  activeCategory,
  loadingCats,
  parentCategories,
}) {
  const processedCategories = useMemo(() => {
    if (!parentCategories) return [];
    return parentCategories.map((c) => ({
      ...c,
      Icon: iconForCategoryName(c.name),
    }));
  }, [parentCategories]);

  return (
    <section
      className="rounded-2xl border border-amber-200/70 bg-white/90 p-4 shadow-md shadow-amber-900/5 backdrop-blur-sm sm:p-6"
      aria-labelledby="home-category-showcase-heading"
    >
      <div className="mb-4 sm:mb-5">
        <h2
          id="home-category-showcase-heading"
          className="text-lg font-bold text-gray-900 sm:text-xl"
        >
          Danh mục đa dạng
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Chọn danh mục để xem sản phẩm phù hợp — từ đồ mới đến đồ đã qua sử dụng,
          tiện mua bán và tiết kiệm hơn.
        </p>
      </div>

      {loadingCats ? (
        <LoadingBlock message="Đang tải danh mục…" className="py-8" />
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6">
          <CategoryTile
            to="/products"
            label="Tất cả"
            active={!activeCategory}
            Icon={LayoutGrid}
          />
          {processedCategories.map((c) => (
            <CategoryTile
              key={c._id}
              to={`/products?category=${c._id}`}
              label={c.name}
              active={String(c._id) === activeCategory}
              Icon={c.Icon}
            />
          ))}
        </div>
      )}
    </section>
  );
}

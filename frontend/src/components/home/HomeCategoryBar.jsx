import { NavLink } from "react-router-dom";
import { Tag, Grid3x3 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomeCategoryBar({
  activeCategory,
  loadingCats,
  parentCategories,
}) {
  return (
    <div
      className="sticky top-0 z-30 border-b border-amber-200/60 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/85"
      aria-label="Danh mục sản phẩm"
    >
      <div className="container mx-auto max-w-7xl px-2 sm:px-4">
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 [scrollbar-gutter:stable]">
          <NavLink
            to="/"
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
              !activeCategory
                ? "!bg-amber-400 !text-white shadow-sm"
                : "!bg-amber-50 !text-amber-900 !hover:!bg-amber-100",
            )}
          >
            <Grid3x3 className="h-4 w-4 shrink-0 opacity-90" />
            Tất cả
          </NavLink>
          {loadingCats ? (
            <span className="text-xs text-muted-foreground px-2">Đang tải…</span>
          ) : (
            parentCategories.map((c) => {
              const active = String(c._id) === activeCategory;
              return (
                <NavLink
                  key={c._id}
                  to={`/?category=${c._id}`}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                    active
                      ? "!border-amber-400 !bg-amber-400 !text-white shadow-sm"
                      : "!border-amber-200/80 !bg-white !text-gray-800 hover:!border-amber-400 hover:!bg-amber-50",
                  )}
                >
                  <Tag className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  {c.name}
                </NavLink>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { Sparkles, ChevronRight, Flame, Clock, Tag, Grid3x3 } from "lucide-react";
import { useGetProduct } from "@/hooks/productHooks/useGetProduct";
import ProductCard from "@/components/product/ProductCard";
import { API } from "@/services/axios";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function sortByNewest(a, b) {
  const ta = new Date(a?.createdAt || 0).getTime();
  const tb = new Date(b?.createdAt || 0).getTime();
  return tb - ta;
}

function Home() {
  const {
    products,
    isLoading,
    activeSearch,
    activeCategory,
    hasLocationFilter,
  } = useGetProduct();

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [categoryRows, setCategoryRows] = useState([]);

  const isFiltered = Boolean(
    activeSearch || hasLocationFilter || activeCategory,
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await API.get("/categories");
        const list = res.data?.category || res.data || [];
        if (!cancelled) setCategories(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setLoadingCats(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Danh mục gốc (đầy đủ, sắp tên A→Z) */
  const parentCategories = useMemo(() => {
    const roots = categories.filter((c) => c.parentId == null);
    return [...roots].sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || ""), "vi", {
        sensitivity: "base",
      }),
    );
  }, [categories]);

  const activeCategoryName = useMemo(() => {
    if (!activeCategory) return "";
    const found = categories.find((c) => String(c._id) === activeCategory);
    return found?.name || "Danh mục";
  }, [activeCategory, categories]);

  useEffect(() => {
    if (isFiltered) {
      setCategoryRows([]);
      return;
    }
    if (parentCategories.length === 0) {
      setCategoryRows([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const rows = await Promise.all(
          parentCategories.map(async (c) => {
            const { data } = await API.get("/products", {
              params: { category: c._id, limit: 5 },
            });
            return {
              _id: c._id,
              name: c.name,
              products: data.products || [],
            };
          }),
        );
        if (!cancelled) setCategoryRows(rows);
      } catch {
        if (!cancelled) setCategoryRows([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [parentCategories, isFiltered]);

  const vipProducts = useMemo(
    () => products.filter((p) => p.isVIP),
    [products],
  );
  const newProducts = useMemo(() => {
    const nonVip = products.filter((p) => !p.isVIP);
    return [...nonVip].sort(sortByNewest);
  }, [products]);

  let sectionTitle = "Sản phẩm mới đăng";
  if (activeSearch && hasLocationFilter) {
    sectionTitle = `Kết quả “${activeSearch}” gần bạn`;
  } else if (activeSearch) {
    sectionTitle = `Kết quả cho “${activeSearch}”`;
  } else if (hasLocationFilter) {
    sectionTitle = "Sản phẩm gần bạn";
  } else if (activeCategory) {
    sectionTitle = `Danh mục: ${activeCategoryName}`;
  }

  let emptyMessage = "Chưa có sản phẩm nào được rao bán.";
  if (isFiltered) {
    emptyMessage = activeSearch
      ? `Không tìm thấy sản phẩm phù hợp với “${activeSearch}”.`
      : "Không có sản phẩm nào trong bán kính đã chọn.";
    if (activeCategory && !activeSearch && !hasLocationFilter) {
      emptyMessage = "Chưa có sản phẩm trong danh mục này.";
    }
  }

  const showDiscovery =
    !isFiltered && !isLoading && (vipProducts.length > 0 || newProducts.length > 0);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-amber-50/80 via-stone-50 to-amber-50/40 pb-12 sm:pb-20">
      {/* —— Danh mục (dưới Header, kiểu Oreka) —— */}
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

      <div className="container mx-auto max-w-7xl px-2 sm:px-4 pt-4 sm:pt-6 space-y-10 sm:space-y-12">
        {!isFiltered && (
          <>
            {/* —— Banner quảng cáo gói VIP —— */}
            <section
              className="relative overflow-hidden rounded-2xl border border-amber-300/50 bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 p-6 sm:p-8 text-white shadow-lg"
              aria-label="Gói hiển thị VIP"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-black/10 blur-xl" />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-xl space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-100">
                    <Sparkles className="h-3.5 w-3.5" />
                    Đẩy tin · Gói VIP
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                    Nổi bật trên trang chủ, ưu tiên trong bảng quản trị
                  </h2>
                  <p className="text-sm text-amber-50/95 sm:text-base">
                    Gói 7 ngày hoặc 30 ngày — thanh toán PayOS. Tin hiển thị{" "}
                    <strong className="font-bold">HOT</strong> như trên các sàn đồ cũ uy tín.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:shrink-0 sm:items-end">
                  <Button
                    asChild
                    size="lg"
                    className="w-full bg-white text-amber-800 shadow-md hover:bg-amber-50 sm:w-auto"
                  >
                    <NavLink to="/my-products">
                      Nâng cấp VIP ngay
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </NavLink>
                  </Button>
                  <p className="text-center text-[11px] text-amber-100/90 sm:text-right">
                    Quản lý tại mục &quot;Tất cả sản phẩm&quot; → Nâng cấp VIP
                  </p>
                </div>
              </div>
            </section>

            {isLoading && (
              <div className="py-16 text-center text-sm text-muted-foreground animate-pulse">
                Đang tải sản phẩm…
              </div>
            )}

            {/* —— HOT —— */}
            {showDiscovery && vipProducts.length > 0 && (
              <section aria-labelledby="home-hot-heading">
                <div className="mb-4 flex items-end justify-between gap-2 pl-1 sm:pl-0">
                  <h2
                    id="home-hot-heading"
                    className="flex items-center gap-2 text-xl font-bold text-gray-900 sm:text-2xl"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-amber-500 text-lg text-white shadow-md">
                      <Flame className="h-5 w-5" aria-hidden />
                    </span>
                    Sản phẩm HOT nổi bật
                  </h2>
                  <NavLink
                    to="/"
                    className="text-sm font-medium text-amber-700 hover:underline"
                  >
                    Xem tất cả
                  </NavLink>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
                  {vipProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {/* —— Mới đăng —— */}
            {showDiscovery && newProducts.length > 0 && (
              <section aria-labelledby="home-new-heading">
                <div className="mb-4 flex items-end justify-between gap-2 pl-1 sm:pl-0">
                  <h2
                    id="home-new-heading"
                    className="flex items-center gap-2 text-xl font-bold text-gray-900 sm:text-2xl"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-amber-600 shadow border border-amber-200">
                      <Clock className="h-5 w-5" aria-hidden />
                    </span>
                    Sản phẩm mới đăng
                  </h2>
                  <NavLink
                    to="/"
                    className="text-sm font-medium text-amber-700 hover:underline"
                  >
                    Xem tất cả
                  </NavLink>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
                  {newProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {/* —— Theo từng danh mục —— */}
            {categoryRows.length > 0 && (
              <div className="space-y-10">
                {categoryRows.map((row) => (
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
                        to={`/?category=${row._id}`}
                        className="inline-flex items-center gap-0.5 text-sm font-medium text-amber-700 hover:underline"
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
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
                        {row.products.map((product) => (
                          <ProductCard key={product._id} product={product} />
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            )}

            {!isLoading && products.length === 0 && (
              <div className="rounded-2xl border border-dashed border-amber-200 bg-white/80 py-16 text-center text-muted-foreground">
                {emptyMessage}
              </div>
            )}
          </>
        )}

        {/* —— Chế độ lọc: tìm kiếm / gần bạn / 1 danh mục —— */}
        {isFiltered && (
          <>
            {isLoading && (
              <div className="py-16 text-center text-sm text-muted-foreground animate-pulse">
                Đang tải…
              </div>
            )}
            {!isLoading && products.length === 0 && (
              <div className="rounded-2xl border border-dashed border-amber-200 bg-white/80 py-16 text-center text-muted-foreground">
                {emptyMessage}
              </div>
            )}
            {!isLoading && products.length > 0 && (
              <section aria-label={sectionTitle}>
                <h2 className="mb-4 text-xl font-bold text-gray-900 sm:text-2xl pl-1 sm:pl-0">
                  {sectionTitle}
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Home;

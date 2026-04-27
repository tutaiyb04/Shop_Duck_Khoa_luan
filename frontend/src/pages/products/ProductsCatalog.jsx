import ProductCard from "@/components/product/ProductCard";
import LoadingBlock from "@/components/shared/LoadingBlock";
import CustomPagination from "@/components/shared/CustomPagination";
import ProductsCatalogSidebar from "@/components/product/cataLog/ProductsCatalogSidebar";
import { useProductsCatalog } from "@/hooks/productHooks/useProductsCatalog";
import EmptyState from "@/components/shared/EmptyState";

function ProductsCatalog() {
  const {
    products,
    loading,
    loadingCats,
    parentCategories,
    pagination,
    filters,
    activePriceRangeId,
    activeCategoryName,
    setParams,
    goToPage,
  } = useProductsCatalog();

  const pageTitle = (() => {
    if (filters.vipOnly) {
      if (filters.category) {
        if (loadingCats && !activeCategoryName) return "Đang tải…";

        const name = activeCategoryName || "Danh mục";
        
        return `Sản phẩm HOT — ${name}`;
      }
      return "Sản phẩm HOT (gói VIP)";
    }
    if (!filters.category) return "Tất cả sản phẩm";
    if (loadingCats && !activeCategoryName) return "Đang tải…";
    return activeCategoryName || "Danh mục";
  })();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-amber-50/80 via-stone-50 to-amber-50/40 pb-16">
      <div className="container mx-auto mt-5 max-w-7xl px-2 sm:px-4 pt-6 sm:pt-8">
       <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <aside className="w-full shrink-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm lg:sticky lg:top-20 lg:w-72 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <ProductsCatalogSidebar
              parentCategories={parentCategories}
              loadingCats={loadingCats}
              filters={filters}
              activePriceRangeId={activePriceRangeId}
              setParams={setParams}
            />
          </aside>

          <div className="min-w-0 flex-1">
            <h1 className="mb-5 !text-4xl font-bold text-yellow-600 sm:text-2xl">
              {pageTitle}
            </h1>
            {loading ? (
              <LoadingBlock message="Đang tải sản phẩm…" className="py-20" />
            ) : products.length === 0 ? (
              <EmptyState message="Không có sản phẩm phù hợp với bộ lọc." />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 sm:gap-4">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
                <CustomPagination
                  pagination={pagination}
                  onPageChange={goToPage}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductsCatalog;

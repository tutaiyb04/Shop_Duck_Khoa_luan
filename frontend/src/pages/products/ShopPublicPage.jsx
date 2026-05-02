import { useParams, NavLink } from "react-router-dom";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import LoadingBlock from "@/components/shared/LoadingBlock";
import EmptyState from "@/components/shared/EmptyState";
import SellerInfoCard from "@/components/product/productDetails/SellerInfoCard";
import ProductCard from "@/components/product/ProductCard";
import CustomPagination from "@/components/shared/CustomPagination";
import { useShopCatalog } from "@/hooks/productHooks/useShopCatalog";
import {
  CATALOG_PRICE_RANGES,
  PRODUCT_CONDITIONS,
} from "@/constants/catalogFilters";
import { cn } from "@/lib/utils";

const FilterChip = ({ active, onClick, children, className }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
        active
          ? "border-amber-500 bg-amber-50 font-semibold text-yellow-800"
          : "border-gray-200 bg-white text-gray-700 hover:border-amber-300 hover:bg-amber-50/60",
        className,
      )}
    >
      {children}
    </button>
  );
}

function ShopPublicPage() {
  const { sellerId } = useParams();
  const {
    seller,
    filterCategories,
    products,
    productPagination,
    loading,
    productsLoading,
    error,
    filters,
    setParams,
    goToProductPage,
    activePriceRangeId,
    reviews,
    reviewPagination,
    reviewsLoading,
    goToReviewPage,
  } = useShopCatalog(sellerId);

  const storeName = (
    seller?.sellerProfile?.storeName ||
    seller?.username ||
    ""
  ).trim();
  const pageTitle = storeName || "Gian hàng";

  const desc = (seller?.sellerProfile?.description || "").trim();

  return (
    <div className="min-h-screen w-full bg-gray-50/30 pb-16">
      <div className="mx-auto max-w-6xl px-2 py-4 sm:px-4 sm:py-6">
        <Breadcrumb className="mb-4 text-sm text-gray-600">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <NavLink to="/" className="!text-yellow-600 !transition-colors hover:!text-yellow-700">Trang chủ</NavLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-gray-900 font-medium">
                {loading ? "…" : pageTitle}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {loading ? (
          <LoadingBlock message="Đang tải gian hàng…" className="py-20" />
        ) : error ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-10 text-center text-gray-700">
            {error}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <SellerInfoCard seller={seller} hideViewShopButton />
            </div>

            {desc ? (
              <Card className="mb-8 border shadow-sm rounded-xl bg-white">
                <CardContent className="p-6">
                  <h2 className="mb-3 text-lg font-semibold text-gray-800">
                    Giới thiệu cửa hàng
                  </h2>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                    {desc}
                  </p>
                </CardContent>
              </Card>
            ) : null}

            <div className="mb-10">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Sản phẩm
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {productPagination.totalItems ?? products.length} sản phẩm
                    đang bán
                    {filters.category ||
                    filters.condition ||
                    filters.minPrice ||
                    filters.maxPrice
                      ? " (đã lọc)"
                      : ""}
                  </p>
                </div>
              </div>

              <Card className="mb-6 border border-gray-200 shadow-sm rounded-xl bg-white">
                <CardContent className="space-y-5 p-4 sm:p-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-900/80">
                        Danh mục
                      </p>
                      <select
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none ring-0 focus:border-amber-400"
                        value={filters.category}
                        onChange={(e) =>
                          setParams({ category: e.target.value || "" })
                        }
                      >
                        <option value="">Tất cả danh mục</option>
                        {filterCategories.map((c) => (
                          <option key={c._id} value={String(c._id)}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-900/80">
                        Tình trạng
                      </p>
                      <select
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none ring-0 focus:border-amber-400"
                        value={filters.condition}
                        onChange={(e) =>
                          setParams({ condition: e.target.value || "" })
                        }
                      >
                        <option value="">Tất cả</option>
                        {PRODUCT_CONDITIONS.map((cnd) => (
                          <option key={cnd} value={cnd}>
                            {cnd}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-900/80">
                        Mức giá
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {CATALOG_PRICE_RANGES.map((r) => (
                          <FilterChip
                            key={r.id}
                            className="whitespace-nowrap"
                            active={
                              r.id === "all"
                                ? activePriceRangeId === "all"
                                : activePriceRangeId === r.id
                            }
                            onClick={() =>
                              setParams({
                                minPrice: r.min || "",
                                maxPrice: r.max || "",
                              })
                            }
                          >
                            {r.label}
                          </FilterChip>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {products.length === 0 && !productsLoading ? (
                <EmptyState message="Không có sản phẩm phù hợp với bộ lọc." />
              ) : (
                <>
                  <div className="relative min-h-[200px]">
                    {productsLoading ? (
                      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-[1px]">
                        <p className="text-sm font-medium text-gray-600">
                          Đang cập nhật…
                        </p>
                      </div>
                    ) : null}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
                      {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                      ))}
                    </div>
                  </div>
                  <CustomPagination
                    pagination={productPagination}
                    onPageChange={goToProductPage}
                  />
                </>
              )}
            </div>

            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100 pb-3">
                <h2 className="text-lg font-bold text-gray-800">
                  Tất cả đánh giá
                </h2>
                {reviewPagination.totalItems > 0 ? (
                  <span className="text-sm text-gray-500">
                    {reviewPagination.totalItems} đánh giá
                  </span>
                ) : null}
              </div>

              {reviewsLoading ? (
                <LoadingBlock message="Đang tải đánh giá…" className="py-12" />
              ) : reviews.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">
                  Chưa có đánh giá từ người mua.
                </p>
              ) : (
                <>
                  <ul className="divide-y divide-gray-100">
                    {reviews.map((rev) => {
                      const buyer = rev.buyerId;
                      const product = rev.productId;
                      const productId =
                        product &&
                        (typeof product === "object"
                          ? product._id
                          : product);
                      const created = rev.createdAt
                        ? new Date(rev.createdAt)
                        : null;

                      return (
                        <li key={rev._id} className="py-4 first:pt-0">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-gray-900">
                                  {buyer?.username?.trim() || "Người mua"}
                                </span>
                                <span className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        "h-4 w-4",
                                        i < (rev.rating || 0)
                                          ? "fill-amber-400 text-amber-400"
                                          : "text-gray-200",
                                      )}
                                    />
                                  ))}
                                </span>
                                {created ? (
                                  <span className="text-xs text-gray-400">
                                    {created.toLocaleDateString("vi-VN")}
                                  </span>
                                ) : null}
                              </div>
                              {rev.comment?.trim() ? (
                                <p className="mt-2 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                                  {rev.comment.trim()}
                                </p>
                              ) : null}
                              {productId ? (
                                <NavLink
                                  to={`/product/${productId}`}
                                  className="mt-2 inline-block text-sm font-medium text-amber-700 hover:text-amber-900 hover:underline"
                                >
                                  {typeof product === "object" &&
                                  product?.name?.trim()
                                    ? `Sản phẩm: ${product.name.trim()}`
                                    : "Xem sản phẩm"}
                                </NavLink>
                              ) : null}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <CustomPagination
                    pagination={reviewPagination}
                    onPageChange={goToReviewPage}
                  />
                </>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default ShopPublicPage;

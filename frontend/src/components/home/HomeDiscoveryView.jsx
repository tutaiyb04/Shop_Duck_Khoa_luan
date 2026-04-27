import { Flame, Clock } from "lucide-react";
import HomeProductSection from "./HomeProductSection";
import HomeCategoryRows from "./HomeCategoryRows";
import LoadingBlock from "@/components/shared/LoadingBlock";
import EmptyState from "../shared/EmptyState";

export default function HomeDiscoveryView({
  isLoading,
  showDiscovery,
  vipProducts,
  newProducts,
  categoryRows,
  products,
  emptyMessage,
}) {
  return (
    <>
      {isLoading && (
        <LoadingBlock message="Đang tải sản phẩm…" />
      )}

      {showDiscovery && vipProducts.length > 0 && (
        <HomeProductSection
          id="home-hot-heading"
          ariaLabelledBy="home-hot-heading"
          title="Sản phẩm HOT nổi bật"
          icon={
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-amber-500 text-lg text-white shadow-md">
              <Flame className="h-5 w-5" aria-hidden />
            </span>
          }
          products={vipProducts}
        />
      )}

      {showDiscovery && newProducts.length > 0 && (
        <HomeProductSection
          id="home-new-heading"
          ariaLabelledBy="home-new-heading"
          title="Sản phẩm mới đăng"
          icon={
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-amber-600 shadow border border-amber-200">
              <Clock className="h-5 w-5" aria-hidden />
            </span>
          }
          products={newProducts}
        />
      )}

      <HomeCategoryRows rows={categoryRows} />

      {!isLoading && products.length === 0 && (
        <EmptyState message={emptyMessage} />
      )}
    </>
  );
}

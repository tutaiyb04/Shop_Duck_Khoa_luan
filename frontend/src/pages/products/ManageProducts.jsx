import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UserSidebar from "@/components/shared/UserSidebar";
import VipUpgradeModal from "@/components/product/VipUpgradeModal";
import useManageProducts from "@/hooks/productHooks/manageProduct/useManageProducts";
import VipInfoBanner from "@/components/product/manageProducts/VipInfoBanner";
import ManageProductsTable from "@/components/product/manageProducts/ManageProductsTable";
import LoadingBlock from "@/components/shared/LoadingBlock";

function ManageProducts() {
  const {
    products,
    loading,
    handleUpdateStatus,
    refresh,
    navigate,
    vipTarget,
    setVipTarget,
    getStatusInfo,
    shouldShowVipUpgrade,
  } = useManageProducts();

  if (loading) {
    return (
      <LoadingBlock message="Đang tải dữ liệu…" className="mt-20 py-12" />
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Sidebar điều hướng */}
        <UserSidebar />

        {/* Khu vực quản lý sản phẩm */}
        <div className="flex-1 w-full min-w-0">
          <Card className="shadow-sm border-1 bg-white">
            <CardHeader className="border-b mb-6">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                Tất cả sản phẩm đã đăng
              </CardTitle>
              <CardDescription>
                Xem, chỉnh sửa, thanh toán gói VIP nổi bật hoặc cập nhật trạng
                thái các món đồ bạn đang rao bán.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <VipInfoBanner />

              <ManageProductsTable
                products={products}
                handleUpdateStatus={handleUpdateStatus}
                navigate={navigate}
                setVipTarget={setVipTarget}
                getStatusInfo={getStatusInfo}
                shouldShowVipUpgrade={shouldShowVipUpgrade}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      <VipUpgradeModal
        open={!!vipTarget}
        onOpenChange={(v) => {
          if (!v) setVipTarget(null);
        }}
        product={vipTarget}
        onPaidRefresh={refresh}
      />
    </div>
  );
}

export default ManageProducts;

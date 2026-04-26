// src/pages/ManageProducts.jsx (hoặc đường dẫn tương ứng của bạn)
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, CheckCircle, Trash2, Sparkles } from "lucide-react";
import UserSidebar from "@/components/shared/UserSidebar";
import VipUpgradeModal from "@/components/product/VipUpgradeModal";
import useManageProducts from "@/hooks/productHooks/useManageProducts";

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
      <div className="text-center mt-20 text-gray-500">
        Đang tải dữ liệu hồ sơ...
      </div>
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
              <div className="mb-4 rounded-lg border border-amber-200/80 bg-amber-50/80 p-3 text-sm text-amber-950">
                <p className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  Gói hiển thị VIP
                </p>
                <p className="mt-1 text-xs sm:text-sm text-amber-900/90 leading-relaxed">
                  Chọn <strong>Nâng cấp VIP</strong> ở bảng dưới: gói 7 hoặc 30
                  ngày, quét mã / thanh toán PayOS. Tin VIP nổi bật trên trang
                  chủ và ưu tiên tại bảng quản trị.
                </p>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Giá</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="min-w-[140px]">HOT / VIP</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products?.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.images[0]}
                              alt=""
                              className="w-12 h-12 rounded object-cover"
                            />
                            <span className="truncate max-w-[150px] md:max-w-[200px]">
                              {product.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{product.price.toLocaleString()}đ</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusInfo(product.status).className}
                          >
                            {getStatusInfo(product.status).label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm align-top max-w-[200px]">
                          <div className="flex flex-col gap-2">
                            {product.isVIP && (
                              <div className="space-y-0.5">
                                <Badge
                                  variant="destructive"
                                  className="!bg-amber-500 text-white border-0 w-fit"
                                >
                                  HOT
                                </Badge>
                                {product.vipUntil && (
                                  <p className="text-[11px] text-gray-500">
                                    Hạn:{" "}
                                    {new Date(product.vipUntil).toLocaleString(
                                      "vi-VN",
                                    )}
                                  </p>
                                )}
                              </div>
                            )}
                            {shouldShowVipUpgrade(product) && (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => setVipTarget(product)}
                                className="!h-8 w-fit text-xs !bg-gradient-to-r !from-red-600 !to-amber-600 hover:!from-red-700 hover:!to-amber-700 text-white !border-0"
                              >
                                {product.isVIP
                                  ? "Gia hạn / VIP"
                                  : "Nâng cấp VIP"}
                              </Button>
                            )}
                            {!product.isVIP &&
                              !shouldShowVipUpgrade(product) && (
                                <span className="text-gray-400 text-xs">—</span>
                              )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right space-x-2 whitespace-nowrap">
                          {product.status !== "SOLD" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="!transition-colors !border-1 !border-gray-200 !bg-gray-200 hover:!bg-gray-300 !ring-0 !outline-none"
                              onClick={() =>
                                navigate(`/edit-product/${product._id}`)
                              }
                            >
                              <Edit className="w-4 h-4 mr-1" /> Sửa
                            </Button>
                          )}
                          {product.status !== "SOLD" && (
                            <Button
                              variant="default"
                              size="sm"
                              className="!transition-colors !border-0 !bg-green-500 hover:!bg-green-600 !ring-0 !outline-none"
                              onClick={() =>
                                handleUpdateStatus(product._id, "SOLD")
                              }
                            >
                              <CheckCircle className="w-4 h-4 mr-1" /> Đã bán
                            </Button>
                          )}
                          {product.status !== "SOLD" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="!transition-colors !border-0 !bg-red-500 hover:!bg-red-600 !ring-0 !outline-none"
                              onClick={() =>
                                handleUpdateStatus(product._id, "HIDDEN")
                              }
                            >
                              <Trash2 className="w-4 h-4 mr-1" /> Xóa tin
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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

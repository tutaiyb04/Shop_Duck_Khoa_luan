import UserSidebar from "@/components/shared/UserSidebar";
import SalesHistoryTable from "@/components/order/SalesHistoryTable";
import { useSalesHistory } from "@/hooks/orderHooks/useSalesHistory";
import { formatVnd } from "@/hooks/orderHooks/usePurchaseHistory";
import LoadingBlock from "@/components/shared/LoadingBlock";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function SalesHistory() {
  const {
    orders,
    total,
    totalDisposalValue,
    currentPage,
    totalPages,
    isLoading,
    goToPage,
  } = useSalesHistory();

  if (isLoading) {
    return (
      <LoadingBlock message="Đang tải lịch sử bán hàng…" className="mt-20 py-12" />
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-6">
        <UserSidebar />

        <div className="flex-1 w-full">
          <Card className="bg-white">
            <CardHeader className="border-b border-border pb-6">
              <CardTitle className="text-2xl font-bold text-gray-800">
                Lịch sử bán hàng
              </CardTitle>
              <CardDescription className="text-gray-600">
                Các giao dịch đã hoàn tất sau khi bạn xác nhận &quot;Đã bán&quot; với
                người mua (thống kê cá nhân, không phải số dư ví).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="rounded-xl border border-amber-100 bg-amber-50/80 px-5 py-4 shadow-sm">
                <p className="text-sm font-medium text-amber-900/90">
                  Tổng giá trị hàng hóa bạn đã thanh lý thành công
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-amber-950">
                  {formatVnd(totalDisposalValue)}
                </p>
                <p className="mt-2 text-xs text-amber-900/70">
                  Tổng cộng {total.toLocaleString("vi-VN")} giao dịch hoàn tất
                </p>
              </div>

              <SalesHistoryTable orders={orders} />
              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 border-t border-border pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    Trước
                  </Button>
                  <span className="px-2 text-sm text-gray-600">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SalesHistory;

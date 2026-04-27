import UserSidebar from "@/components/shared/UserSidebar";
import SalesHistoryTable from "@/components/order/SalesHistoryTable";
import { useSalesHistory } from "@/hooks/orderHooks/useSalesHistory";
import { formatVnd } from "@/hooks/orderHooks/usePurchaseHistory";
import LoadingBlock from "@/components/shared/LoadingBlock";
import { Button } from "@/components/ui/button";

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

        <div className="flex-1 w-full space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Lịch sử bán hàng
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Các giao dịch đã hoàn tất sau khi bạn xác nhận &quot;Đã bán&quot; với
              người mua (thống kê cá nhân, không phải số dư ví).
            </p>
          </div>

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

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <SalesHistoryTable orders={orders} />
            {totalPages > 1 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => goToPage(currentPage - 1)}
                >
                  Trước
                </Button>
                <span className="text-sm text-gray-600 px-2">
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesHistory;

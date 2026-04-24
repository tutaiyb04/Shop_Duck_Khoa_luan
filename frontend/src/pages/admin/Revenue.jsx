import useVipRevenue from "@/hooks/adminHooks/useVipRevenue";
import VipTransactionTable, {
  formatVnd,
} from "@/components/admin/revenue/VipTransactionTable";
import CustomPagination from "@/components/shared/CustomPagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3, Wallet, Receipt } from "lucide-react";

function Revenue() {
  const {
    transactions,
    loading,
    pagination,
    totalRevenue,
    successCount,
    status,
    setStatus,
    fetchList,
  } = useVipRevenue();

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-bold text-yellow-600 sm:text-2xl">
          <BarChart3 className="h-7 w-7" />
          Doanh thu — gói VIP
        </h1>
        <p className="mt-2 text-sm text-gray-500 sm:text-base">
          Theo dõi các giao dịch thanh toán gói hiển thị VIP (PayOS) và tổng
          doanh thu từ giao dịch thành công. Hai ô thống kê phía dưới là tổng
          toàn hệ thống; bảng có thể lọc theo trạng thái từng giao dịch.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-lg border border-amber-200/80 bg-amber-50/80 p-4">
          <div className="rounded-lg bg-amber-500/15 p-2 text-amber-800">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-amber-900/80">
              Tổng doanh thu (thành công)
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-amber-950 sm:text-3xl">
              {formatVnd(totalRevenue)}
            </p>
            <p className="mt-0.5 text-xs text-amber-900/70">
              Cộng tất cả giao dịch trạng thái &quot;Thành công&quot;
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
          <div className="rounded-lg bg-slate-500/10 p-2 text-slate-800">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
              Số giao dịch thành công
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900 sm:text-3xl">
              {successCount.toLocaleString("vi-VN")}
            </p>
            <p className="mt-0.5 text-xs text-slate-600">
              Tổng số lần thanh toán VIP hoàn tất
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          Danh sách giao dịch
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Lọc trạng thái:</span>
          <Select
            value={status || "all"}
            onValueChange={(v) => setStatus(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="SUCCESS">Thành công</SelectItem>
              <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
              <SelectItem value="CANCELLED">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <VipTransactionTable transactions={transactions} loading={loading} />

      <div className="mt-4">
        <CustomPagination
          pagination={pagination}
          onPageChange={(page) => fetchList(page)}
        />
      </div>
    </div>
  );
}

export default Revenue;

import {
  LayoutDashboard,
  Tag,
  Users,
  Package,
  AlertTriangle,
  BarChart3,
  Loader2,
} from "lucide-react";
import useAdminDashboard from "@/hooks/adminHooks/useAdminDashboard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import LoadingBlock from "@/components/shared/LoadingBlock";
import StatCard from "@/components/admin/dashboard/StatCard";


function formatVnd(n) {
  if (n == null || Number.isNaN(Number(n))) return "0 ₫";
  return `${Number(n).toLocaleString("vi-VN")} ₫`;
}

function Dashboard() {
  const { stats, loading, refetch } = useAdminDashboard();
  const { users, products, categories, reports, revenue } = stats;

  return (
    <div className="space-y-6">
      <Card className="gap-0 border-slate-200/85 bg-white py-0 shadow-sm">
        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6">
          <div className="min-w-0">
            <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight !text-yellow-600 sm:text-3xl">
              Tổng quan
            </h1>
            <p className="mt-2 text-sm leading-relaxed !text-slate-600 sm:text-base">
              Thống kê nhanh các mục quản trị: danh mục, người dùng, sản phẩm,
              báo cáo và doanh thu gói VIP.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={loading}
            className="shrink-0 !border-0 !transition-colors !bg-yellow-500 text-white hover:!bg-yellow-600 hover:text-white"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Làm mới
          </Button>
        </div>
      </Card>

      {loading && (
        <LoadingBlock message="Đang tải dữ liệu thống kê…" className="py-20" />
      )}

      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            to="/admin/categories"
            icon={Tag}
            title="Danh mục"
            value={categories.total.toLocaleString("vi-VN")}
            subtitle="Tổng số mục danh mục trong hệ thống"
            footnote="Quản lý cây danh mục cha — con"
            tone="slate"
          />
          <StatCard
            to="/admin/users"
            icon={Users}
            title="Người dùng (tài khoản user)"
            value={users.total.toLocaleString("vi-VN")}
            subtitle={`Hoạt động: ${users.active.toLocaleString("vi-VN")} · Đã khóa: ${users.locked.toLocaleString("vi-VN")}`}
            footnote="Không gồm tài khoản admin"
            tone="slate"
          />
          <StatCard
            to="/admin/products"
            icon={Package}
            title="Sản phẩm"
            value={products.total.toLocaleString("vi-VN")}
            subtitle={`Chờ duyệt: ${products.pending.toLocaleString("vi-VN")}`}
            footnote="Tổng tin đăng ở mọi trạng thái"
            tone="amber"
          />
          <StatCard
            to="/admin/reports"
            icon={AlertTriangle}
            title="Báo cáo vi phạm"
            value={reports.pending.toLocaleString("vi-VN")}
            subtitle={`Tổng: ${reports.total.toLocaleString("vi-VN")} báo cáo`}
            footnote="Số cần xử lý = trạng thái Chờ (PENDING)"
            tone="red"
          />
          <StatCard
            to="/admin/revenue"
            icon={BarChart3}
            title="Doanh thu gói VIP (thành công)"
            value={formatVnd(revenue.totalVnd)}
            subtitle={`${revenue.vipTransactionSuccess.toLocaleString("vi-VN")} giao dịch thành công`}
            footnote="Thanh toán PayOS — cộng theo giao dịch SUCCESS"
            tone="amber"
          />
        </div>
      )}

      {!loading && (
        <Card className="gap-0 border-slate-200/85 border-dashed bg-white py-0 shadow-sm">
          <CardContent className="px-5 py-4 sm:px-6 sm:py-5">
            <p className="text-sm font-semibold text-slate-800">Gợi ý</p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              Bấm vào từng ô để mở đúng trang quản lý. Số liệu được lấy trực
              tiếp từ cơ sở dữ liệu tại thời điểm tải trang.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Dashboard;

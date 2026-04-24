import { Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Tag,
  Users,
  Package,
  AlertTriangle,
  BarChart3,
  ChevronRight,
  Loader2,
} from "lucide-react";
import useAdminDashboard from "@/hooks/adminHooks/useAdminDashboard";
import { Button } from "@/components/ui/button";

function formatVnd(n) {
  if (n == null || Number.isNaN(Number(n))) return "0 ₫";
  return `${Number(n).toLocaleString("vi-VN")} ₫`;
}

function StatCard({
  to,
  icon: Icon,
  title,
  value,
  subtitle,
  footnote,
  tone = "slate",
}) {
  const ring =
    tone === "amber"
      ? "border-amber-200/90 bg-amber-50/90 hover:border-amber-300"
      : tone === "red"
        ? "border-red-200/80 bg-red-50/50 hover:border-red-300"
        : "border-slate-200/90 bg-white hover:border-amber-200/80";
  const iconWrap =
    tone === "amber"
      ? "bg-amber-500/15 text-amber-800"
      : tone === "red"
        ? "bg-red-500/10 text-red-800"
        : "bg-slate-500/10 text-slate-800";

  return (
    <NavLink
      to={to}
      className={`group flex flex-col rounded-xl border p-4 shadow-sm transition-colors sm:p-5 ${ring}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={`rounded-lg p-2.5 ${iconWrap}`}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-amber-600" />
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-500">
        {title}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900 sm:text-3xl">
        {value}
      </p>
      {subtitle && (
        <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
      )}
      {footnote && (
        <p className="mt-2 text-xs text-muted-foreground">{footnote}</p>
      )}
    </NavLink>
  );
}

function Dashboard() {
  const { stats, loading, refetch } = useAdminDashboard();
  const { users, products, categories, reports, revenue } = stats;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-yellow-600 sm:text-3xl">
            <LayoutDashboard className="h-8 w-8" />
            Tổng quan
          </h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            Thống kê nhanh các mục quản trị: danh mục, người dùng, sản phẩm, báo
            cáo và doanh thu gói VIP.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={loading}
          className="shrink-0 border-amber-200 bg-white"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Làm mới
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
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
        <div className="rounded-xl border border-dashed border-amber-200/80 bg-amber-50/30 p-4 text-sm text-gray-600">
          <p className="font-medium text-amber-900/90">Gợi ý</p>
          <p className="mt-1">
            Bấm vào từng ô để mở đúng trang quản lý. Số liệu được lấy trực tiếp
            từ cơ sở dữ liệu tại thời điểm tải trang.
          </p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

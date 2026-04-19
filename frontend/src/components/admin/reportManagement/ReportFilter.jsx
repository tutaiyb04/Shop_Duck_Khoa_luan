// frontend/src/components/admin/reportManagement/ReportFilter.jsx
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

function ReportFilter({ filters, setFilters }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Ô tìm kiếm theo lý do hoặc người báo cáo */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Tìm kiếm báo cáo..."
          className="pl-9 !ring-0 focus-visible:border-yellow-500"
          value={filters.search || ""}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </div>

      {/* Lọc trạng thái giống dropdown của Product */}
      <select
        className="h-10 rounded-md border border-gray-200 px-3 text-sm focus:ring-2 focus:ring-yellow-500 focus:outline-none w-full sm:w-auto"
        value={filters.status || ""}
        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
      >
        <option value="">Tất cả trạng thái</option>
        <option value="PENDING">Chờ duyệt</option>
        <option value="RESOLVED">Vi phạm (Đã xử lý)</option>
        <option value="REJECTED">Bỏ qua</option>
      </select>
    </div>
  );
}

export default ReportFilter;

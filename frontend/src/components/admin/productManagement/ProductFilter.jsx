import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

function ProductFilter({ filters, setFilters }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Ô tìm kiếm */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Tìm kiếm theo tên sản phẩm..."
          className="pl-9 !ring-0 focus-visible:border-yellow-500"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </div>

      {/* Lọc trạng thái */}
      <select
        className="h-10 rounded-md border border-gray-200 px-3 text-sm focus:ring-2 focus:ring-yellow-500 focus:outline-none"
        value={filters.status}
        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
      >
        <option value="">Tất cả trạng thái</option>
        <option value="PENDING">Chờ duyệt</option>
        <option value="AVAILABLE">Đang bán</option>
        <option value="REJECTED">Bị từ chối</option>
        <option value="LOCKED">Bị khóa</option>
        <option value="SOLD">Đã bán</option>
        <option value="HIDDEN">Đã ẩn</option>
      </select>
    </div>
  );
}

export default ProductFilter;

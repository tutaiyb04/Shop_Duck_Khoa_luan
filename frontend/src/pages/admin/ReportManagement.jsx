import useReportManagement from "@/hooks/adminHooks/useReportManagement";
import ReportFilter from "@/components/admin/reportManagement/ReportFilter";
import ReportTable from "@/components/admin/reportManagement/ReportTable";

function ReportManagement() {
  const { reports, loading, filters, setFilters, handleResolve } =
    useReportManagement();

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-yellow-600 flex items-center gap-2">
          Quản lý Báo cáo Vi phạm
        </h1>
        <p className="text-xl text-gray-500 mt-5">
          Xem và xử lý các báo cáo từ người dùng để bảo vệ cộng đồng Duck Shop.
        </p>
      </div>

      {/* Sử dụng component Filter riêng biệt giống Product */}
      <ReportFilter filters={filters} setFilters={setFilters} />

      <ReportTable
        reports={reports}
        loading={loading}
        onResolve={handleResolve}
      />
    </div>
  );
}

export default ReportManagement;

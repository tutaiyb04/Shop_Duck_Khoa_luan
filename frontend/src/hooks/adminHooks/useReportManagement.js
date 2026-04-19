import { API } from "@/services/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function useReportManagement() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
  });
  const [filters, setFilters] = useState({ status: "", search: "" });

  const fetchReports = async (page = 1) => {
    setLoading(true);
    try {
      const res = await API.get("/reports/admin/all", {
        params: { status: filters.status, search: filters.search, page },
      });

      setReports(res.data.result.reports);
      setPagination({
        totalPages: res.data.result.totalPages,
        currentPage: res.data.result.currentPage,
      });
    } catch (error) {
      toast.error("Không thể tải danh sách báo cáo");
      console.log("Lỗi: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Nên dùng debounce ở đây nếu search nhiều, nhưng tạm thời gọi trực tiếp
    const delayDebounceFn = setTimeout(() => {
      fetchReports(1);
    }, 500); // Đợi gõ xong 0.5s mới tìm
    return () => clearTimeout(delayDebounceFn);
  }, [filters.status, filters.search]);

  const handleResolve = async (id, action, note) => {
    try {
      await API.put(`/reports/admin/${id}/resolve`, {
        action,
        adminNote: note,
      });
      toast.success(
        action === "APPROVE"
          ? "Đã duyệt và thực thi kỷ luật"
          : "Đã từ chối báo cáo",
      );
      fetchReports(pagination.currentPage); // Tải lại trang hiện tại
    } catch (error) {
      toast.error(error.response?.data?.message || "Thao tác thất bại");
      console.log("Lỗi: ", error);
    }
  };

  return {
    reports,
    loading,
    filters,
    setFilters,
    handleResolve,
    pagination,
  };
}

export default useReportManagement;

import { API } from "@/services/axios";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const initialPagination = { totalPages: 1, currentPage: 1, total: 0 };


// Giao dịch mua gói VIP (admin) + tổng doanh thu thành công.
function useVipRevenue() {
  const [transactions, setTransactions] = useState([]); // Lưu danh sách các giao dịch
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(initialPagination);
  const [totalRevenue, setTotalRevenue] = useState(0);  // Lưu tổng doanh thu
  const [successCount, setSuccessCount] = useState(0);  // Lưu tổng số lượt nạp VIP thành công
  const [status, setStatus] = useState("");

  const fetchList = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await API.get("/payment/admin/vip-transactions", {
          params: {
            page,
            limit: 15,
            ...(status ? { status } : {}),
          },
        });
        const response = res.data?.result;
        if (!response) {
          setTransactions([]);
          setPagination(initialPagination);
          return;
        }
        setTransactions(response.transactions || []);
        setTotalRevenue(Number(response.totalRevenue) || 0);
        setSuccessCount(Number(response.successCount) || 0);
        setPagination({
          totalPages: response.totalPages || 1,
          currentPage: response.currentPage || 1,
          total: response.total ?? 0,
        });
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Không thể tải giao dịch VIP",
        );
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    },
    [status],
  );

  useEffect(() => {
    fetchList(1);
  }, [fetchList]);

  return {
    transactions,
    loading,
    pagination,
    totalRevenue,
    successCount,
    status,
    setStatus,
    fetchList,
  };
}

export default useVipRevenue;

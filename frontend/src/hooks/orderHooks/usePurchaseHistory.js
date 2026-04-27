import { useCallback, useEffect, useState } from "react";
import { API } from "@/services/axios";
import toast from "react-hot-toast";

export function formatVnd(n) {
  if (n == null || Number.isNaN(Number(n))) return "0 ₫";
  return `${Number(n).toLocaleString("vi-VN")} ₫`;
}

export function usePurchaseHistory() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPage = useCallback(async (page) => {
    setIsLoading(true);
    try {
      const { data } = await API.get("/orders/purchases/history", {
        params: { page, limit: 20 },
      });
      setOrders(data.orders || []);
      setTotal(data.total ?? 0);
      setCurrentPage(data.currentPage ?? page);
      setTotalPages(data.totalPages ?? 1);
    } catch (e) {
      console.error(e);
      toast.error(
        e.response?.data?.message || "Không tải được lịch sử mua hàng",
      );
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  return {
    orders,
    total,
    currentPage,
    totalPages,
    isLoading,
    goToPage: fetchPage,
    refetch: () => fetchPage(currentPage),
  };
}

import { API } from "@/services/axios";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const emptyStats = {
  users: { total: 0, active: 0, locked: 0 },
  products: { total: 0, pending: 0, byStatus: {} },
  categories: { total: 0 },
  reports: { total: 0, pending: 0 },
  revenue: { totalVnd: 0, vipTransactionSuccess: 0 },
};

function useAdminDashboard() {
  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/stats");
      const r = res.data?.result;
      if (r) {
        setStats({
          users: { ...emptyStats.users, ...r.users },
          products: {
            ...emptyStats.products,
            ...r.products,
            byStatus: { ...emptyStats.products.byStatus, ...r.products?.byStatus },
          },
          categories: { ...emptyStats.categories, ...r.categories },
          reports: { ...emptyStats.reports, ...r.reports },
          revenue: { ...emptyStats.revenue, ...r.revenue },
        });
      } else {
        setStats(emptyStats);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Không tải được tổng quan");
      setStats(emptyStats);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}

export default useAdminDashboard;

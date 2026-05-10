import { useMemo, useState } from "react";
import { usePurchaseHistory, formatVnd } from "@/hooks/orderHooks/usePurchaseHistory";

export const ORDER_TABS = ["Tất cả", "Chờ xác nhận", "Đã giao"];

const STATUS_TO_LABEL = {
  PENDING: "Chờ xác nhận",
  COMPLETED: "Đã giao",
};

function orderToTableRow(order) {
  const pid = order.productId?._id || order.productId;
  const sid = order.sellerId?._id || order.sellerId;
  const raw = order.status ? String(order.status).toUpperCase() : "";
  const label = STATUS_TO_LABEL[raw] || raw || "—";
  const code = order._id
    ? String(order._id).slice(-8).toUpperCase()
    : "—";
  return {
    id: `DH${code}`,
    productName: order.productId?.name ?? "—",
    price: formatVnd(order.totalAmount),
    status: label,
    sellerId: sid ? String(sid) : "",
    productId: pid ? String(pid) : "",
  };
}

export function useOrder() {
  const [activeTab, setActiveTab] = useState("Tất cả");
  const {
    orders,
    total,
    currentPage,
    totalPages,
    isLoading,
    goToPage,
    refetch,
  } = usePurchaseHistory();

  const rows = useMemo(() => orders.map(orderToTableRow), [orders]);

  const filteredOrders = useMemo(() => {
    if (activeTab === "Tất cả") return rows;
    return rows.filter((o) => o.status === activeTab);
  }, [rows, activeTab]);

  return {
    tabs: ORDER_TABS,
    activeTab,
    setActiveTab,
    filteredOrders,
    isLoadingData: isLoading,
    total,
    currentPage,
    totalPages,
    goToPage,
    refetch,
  };
}

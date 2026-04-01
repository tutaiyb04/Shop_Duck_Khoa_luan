import { useEffect, useState } from "react";

export const ORDER_TABS = [
  "Tất cả",
  "Chờ xác nhận",
  "Đang giao",
  "Đã giao",
  "Đã hủy",
];

const mockOrders = [
  {
    id: "DH12345",
    productName: "iPhone 12 Pro Max cũ",
    price: "12.500.000đ",
    status: "Đã giao",
    sellerId: "65f1a2b00000000000000001",
    productId: "111000000000000000000001",
  },
  {
    id: "DH12346",
    productName: "Bàn phím cơ Keychron",
    price: "1.200.000đ",
    status: "Đang giao",
    sellerId: "65f1a2c0000000000000002",
    productId: "222000000000000000000002",
  },
  {
    id: "DH12347",
    productName: "Chuột Logitech G102",
    price: "350.000đ",
    status: "Chờ xác nhận",
    sellerId: "65f1a2d0000000000000003",
    productId: "333000000000000000000003",
  },
  {
    id: "DH12348",
    productName: "Màn hình Dell Ultrasharp",
    price: "4.500.000đ",
    status: "Đã hủy",
    sellerId: "65f1a2e000000000000004",
    productId: "444000000000000000000004",
  },
];

export function useOrder() {
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoadingData(true);
        // Giả lập chờ API 1 giây
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Lỗi tải đơn hàng:", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = mockOrders.filter((order) => {
    if (activeTab === "Tất cả") return true;
    return order.status === activeTab;
  });

  return {
    tabs: ORDER_TABS,
    activeTab,
    setActiveTab,
    filteredOrders,
    isLoadingData,
  };
}

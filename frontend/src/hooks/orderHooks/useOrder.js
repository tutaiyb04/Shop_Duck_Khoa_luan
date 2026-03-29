import toast from "react-hot-toast";
import { useState } from "react";
import { API } from "@/services/axios";

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

  const filteredOrders = mockOrders.filter((order) => {
    if (activeTab === "Tất cả") return true;
    return order.status === activeTab;
  });

  const [reviewOrderData, setReviewOrderData] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  const openReviewModal = (sellerId, productId) => {
    setReviewOrderData({ sellerId, productId });
    setRating(0);
    setComment("");
  };

  const closeReviewModal = () => {
    setReviewOrderData(null);
    setRating(0);
    setComment("");
  };

  const submitReview = async () => {
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá (từ 1 đến 5 sao)!");
      return;
    }
    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá!");
      return;
    }

    setIsReviewLoading(true);
    try {
      await API.post("/reviews", {
        sellerId: reviewOrderData.sellerId,
        productId: reviewOrderData.productId,
        rating,
        comment,
      });

      console.log("Đang gửi data:", { ...reviewOrderData, rating, comment });
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Giả lập chờ API 1 giây

      toast.success("Đánh giá sản phẩm thành công!");
      closeReviewModal(); // Đóng Modal khi thành công
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi gửi đánh giá.");
    } finally {
      setIsReviewLoading(false);
    }
  };
  return {
    activeTab,
    setActiveTab,
    tabs: ORDER_TABS,
    filteredOrders,
    isReviewModalOpen: !!reviewOrderData, // Ép kiểu boolean: có data là true (mở), null là false (đóng)
    rating,
    setRating,
    comment,
    setComment,
    isReviewLoading,
    openReviewModal,
    closeReviewModal,
    submitReview,
  };
}

import toast from "react-hot-toast";
import { API } from "@/services/axios";
import { useState } from "react";

export const useReviewModal = () => {
  const [reviewOrderId, setReviewOrderId] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  const isReviewModalOpen = Boolean(reviewOrderId);

  const openReviewModal = (orderId) => {
    setReviewOrderId(orderId ? String(orderId) : null);
    setRating(0);
    setComment("");
  };

  const closeReviewModal = () => {
    setReviewOrderId(null);
    setRating(0);
    setComment("");
  };

  const submitReview = async () => {
    if (!reviewOrderId) {
      toast.error("Thiếu thông tin đơn hàng.");
      return false;
    }
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá (từ 1 đến 5 sao)!");
      return false;
    }
    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá!");
      return false;
    }

    setIsReviewLoading(true);
    try {
      await API.post("/reviews", {
        orderId: reviewOrderId,
        rating,
        comment,
      });

      toast.success("Đánh giá đơn hàng thành công!");
      closeReviewModal();
      return true;
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá.",
      );
      return false;
    } finally {
      setIsReviewLoading(false);
    }
  };

  return {
    isReviewModalOpen,
    rating,
    setRating,
    comment,
    setComment,
    isReviewLoading,
    openReviewModal,
    closeReviewModal,
    submitReview,
  };
};

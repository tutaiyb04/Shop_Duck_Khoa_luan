import toast from "react-hot-toast";
import { API } from "@/services/axios";
import { useState } from "react";

export const useReviewModal = () => {
  const [reviewOrderData, setReviewOrderData] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  const isReviewModalOpen = Boolean(reviewOrderData);

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

      // Giả lập chờ API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Đánh giá sản phẩm thành công!");
      closeReviewModal();

      // Chú ý: Có thể bạn sẽ cần trigger một callback để refresh lại list order
      // hoặc đổi trạng thái đơn hàng thành "Đã đánh giá" ở đây.
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi gửi đánh giá.");
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

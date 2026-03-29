import React, { useState } from "react";
import toast from "react-hot-toast"; // Đảm bảo dùng react-hot-toast cho khớp với App.jsx của bạn
import { Star } from "lucide-react";
import { API } from "@/services/axios"; // Đảm bảo file axios export biến API nhé
import { Button } from "@/components/ui/button";

const ReviewModal = ({ sellerId, productId, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    setComment("");
    setRating(0);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá (từ 1 đến 5 sao)!");
      return;
    }

    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá!");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/reviews", {
        sellerId,
        productId,
        rating,
        comment,
      });

      toast.success(res.data?.message || "Đánh giá thành công!");
      handleClose(); // Đóng và dọn dẹp sạch sẽ Form

      if (onSuccess) onSuccess(); // Gọi hàm load lại bảng đơn hàng nếu có
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-amber-400 text-black hover:bg-amber-500 font-semibold shadow-sm"
      >
        Đánh giá người bán
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={handleClose} // Đổi thành gọi hàm handleClose
              disabled={loading} // Khi đang gửi thì không cho bấm X
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold disabled:opacity-50"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">Đánh giá giao dịch</h2>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 justify-center py-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-8 h-8 cursor-pointer transition-colors ${
                      // Nếu rating là 0, không có sao nào tô màu (star <= rating là false)
                      star <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    } ${loading ? "opacity-50 pointer-events-none" : ""}`} // Mờ đi khi đang gửi
                    onClick={() => setRating(star)} // Click vào sao nào, số sao nhảy lên bấy nhiêu
                  />
                ))}
              </div>

              <div>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  rows="4"
                  placeholder="Nhận xét của bạn về sản phẩm và người bán..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={loading} // Khoá ô nhập khi đang gửi
                ></textarea>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                // Nếu chưa chọn sao, nút nhìn mờ hơn tí cho đúng logic UX (opacity-70)
                className={`w-full bg-amber-400 text-black hover:bg-amber-500 font-bold shadow-sm ${rating === 0 ? "opacity-70" : ""}`}
              >
                {loading ? "Đang gửi..." : "Gửi đánh giá"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewModal;

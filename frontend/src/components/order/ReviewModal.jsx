import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const ReviewModal = ({
  isOpen,
  onClose,
  rating,
  setRating,
  comment,
  setComment,
  onSubmit,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-xl">
        {/* Nút tắt Modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
          Đánh giá sản phẩm
        </h2>

        {/* Khu vực chọn sao */}
        <div className="flex gap-2 justify-center mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-8 h-8 cursor-pointer transition-colors ${
                star <= rating
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-300"
              } ${loading ? "opacity-50 pointer-events-none" : ""}`}
              onClick={() => setRating(star)}
            />
          ))}
        </div>

        {/* Ô nhập đánh giá */}
        <div className="mb-6">
          <textarea
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none text-sm"
            rows="4"
            placeholder="Nhận xét của bạn về sản phẩm và người bán..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={loading}
          ></textarea>
        </div>

        {/* Nút Submit */}
        <Button
          onClick={onSubmit}
          disabled={loading}
          className={`w-full bg-amber-400 text-black hover:bg-amber-500 font-bold h-11 ${
            rating === 0 ? "opacity-70" : ""
          }`}
        >
          {loading ? "Đang gửi..." : "Gửi đánh giá"}
        </Button>
      </div>
    </div>
  );
};

export default ReviewModal;

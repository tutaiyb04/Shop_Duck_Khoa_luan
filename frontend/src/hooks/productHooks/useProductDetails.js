import toast from "react-hot-toast";
import { useState, useEffect, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { API } from "@/services/axios";
import { AuthContext } from "@/context/AuthContext";

export function useProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReporting, setIsReporting] = useState(false);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { user } = useContext(AuthContext);
  const lastShareTime = useRef(0);

  const maxQuantity = product?.quantity || 1; // Lấy số lượng từ Database

  const handleDecrease = () => {
    if (buyQuantity > 1) setBuyQuantity((prev) => prev - 1);
  };

  const handleIncrease = () => {
    if (buyQuantity < maxQuantity) setBuyQuantity((prev) => prev + 1);
  };

  const handlePrevImage = () => {
    setActiveImage((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    setActiveImage((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1,
    );
  };

  const handleToggleLike = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để lưu sản phẩm!");
      return;
    }

    try {
      // Gọi API toggle
      const res = await API.post("/user/wishlist/toggle", { productId: id });

      // Cập nhật UI ngay lập tức dựa trên kết quả trả về
      setIsLiked(res.data.isLiked);
      toast.success(res.data.message);
    } catch (error) {
      console.log("Lỗi khi ấn yêu thích: ", error);
      toast.error("Không thể cập nhật danh sách yêu thích");
    }
  };

  // Hàm gửi báo cáo vi phạm
  const handleSendReport = async (reportData) => {
    setIsReporting(true);
    try {
      await API.post("/reports", {
        targetType: "Product",
        targetId: id,
        reason: reportData.reason,
        description: reportData.description,
      });
      toast.success("Cảm ơn bạn! Báo cáo đã được gửi tới đội ngũ quản trị.");
      return true; // Để đóng Modal
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi gửi báo cáo");
      return false;
    } finally {
      setIsReporting(false);
    }
  };

  const handleShare = async () => {
    const now = Date.now();
    if (now - lastShareTime.current < 1500) return;
    lastShareTime.current = now;

    const currentUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name || "Sản phẩm trên Duck Shop",
          text: "Xem ngay sản phẩm cực hot này trên Duck Shop nhé!",
          url: currentUrl,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          console.log("Lỗi hệ thống khi chia sẻ: ", error);
        }
      }
    } else {
      // Fallback cho PC
      try {
        await navigator.clipboard.writeText(currentUrl);
        toast.success("Đã sao chép đường dẫn sản phẩm!", { id: "share-toast" });
      } catch (error) {
        console.log("Lỗi khi share sản phẩm: ", error);
        toast.error("Không thể sao chép đường dẫn", { id: "share-toast-err" });
      }
    }
  };

  // Kiểm tra trạng thái yêu thích ban đầu khi load sản phẩm
  useEffect(() => {
    if (user && product) {
      // Kiểm tra ID sản phẩm có trong mảng wishlist của user không
      const wishlist = user.buyerProfile?.wishlist || [];
      const productId = product._id || id;
      setIsLiked(wishlist.includes(productId));
    }
  }, [user, product, id]);

  // Fetch dữ liệu sản phẩm
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await API.get(`/products/${id}`);
        setProduct(response.data.product);
      } catch (error) {
        toast.error("Không thể tải thông tin sản phẩm");
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  return {
    product,
    isLoading,
    isReporting,
    handleSendReport,
    handlePrevImage,
    handleNextImage,
    handleDecrease,
    handleIncrease,
    isLiked,
    handleToggleLike,
    buyQuantity,
    maxQuantity,
    activeImage,
    setActiveImage,
    isReportModalOpen,
    setIsReportModalOpen,
    handleShare,
  };
}

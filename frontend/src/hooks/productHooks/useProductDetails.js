import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API } from "@/services/axios";
import toast from "react-hot-toast";

export function useProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReporting, setIsReporting] = useState(false);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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

  // 1. Fetch dữ liệu sản phẩm
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

  // 2. Hàm gửi báo cáo vi phạm
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

  return {
    product,
    isLoading,
    isReporting,
    handleSendReport,
    handlePrevImage,
    handleNextImage,
    handleDecrease,
    handleIncrease,
    buyQuantity,
    maxQuantity,
    activeImage,
    setActiveImage,
    isReportModalOpen,
    setIsReportModalOpen,
  };
}

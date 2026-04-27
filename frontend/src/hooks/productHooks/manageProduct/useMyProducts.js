import toast from "react-hot-toast";
import { useEffect, useState, useCallback } from "react";
import { API } from "@/services/axios";

function useMyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get("/products/my-products/all", {
        params: { page: 1, limit: 200 },
      });
      setProducts(response.data.products);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tải sản phẩm");
    } finally {
      setLoading(false);
    }
  }, []);

  /** Ẩn tin — chỉ đổi status qua PATCH */
  const handleUpdateStatus = async (id, status) => {
    try {
      await API.patch(`/products/${id}/status`, { status });
      toast.success("Đã xóa sản phẩm");
      fetchMyProducts();
    } catch (error) {
      console.log("Lỗi khi cập nhật sản phẩm: ", error);
      toast.error("Cập nhật thất bại");
    }
  };

  /**
   * Hoàn tất bán (đơn + SOLD) — phải chọn người mua đã từng chat (backend transaction).
   */
  const markSoldToBuyer = async (productId, buyerId) => {
    await API.post("/orders/complete-offline-sale", {
      productId,
      buyerId,
    });
    toast.success("Đã ghi nhận bán hàng — có trong Lịch sử mua/bán.");
    await fetchMyProducts();
  };

  useEffect(() => {
    fetchMyProducts();
  }, [fetchMyProducts]);

  return {
    products,
    loading,
    handleUpdateStatus,
    markSoldToBuyer,
    refresh: fetchMyProducts,
  };
}

export default useMyProducts;

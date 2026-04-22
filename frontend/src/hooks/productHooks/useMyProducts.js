import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { API } from "@/services/axios";

function useMyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const response = await API.get("/products/my-products/all");
      setProducts(response.data.products);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await API.patch(`/products/${id}/status`, { status });
      toast.success(
        status === "SOLD" ? "Đã đánh dấu Đã bán" : "Đã xóa sản phẩm",
      );
      fetchMyProducts();
    } catch (error) {
      console.log("Lỗi khi cập nhật sản phẩm: ", error);
      toast.error("Cập nhật thất bại");
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  return { products, loading, handleUpdateStatus, refresh: fetchMyProducts };
}

export default useMyProducts;

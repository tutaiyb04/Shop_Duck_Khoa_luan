import { API } from "@/services/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function useAdminProduct() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
  });

  const fetchProducts = async () => {
    setLoading(true);

    try {
      const response = await API.get("products/admin/all", {
        params: filters,
      });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Lỗi fetchProducts:", error);
      toast.error("Không thể tải danh sách sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  // Kỹ thuật Debounce: Chờ Admin gõ xong 500ms (nửa giây) thì mới gọi API
  useEffect(() => {
    const delayTimer = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(delayTimer);
  }, [filters]); // Lắng nghe sự thay đổi của biến filters

  const handleUpdateStatus = async (productId, newStatus) => {
    let actionName = "Duyệt";
    if (newStatus === "LOCKED") actionName = "khóa bài đăng";
    if (newStatus === "REJECTED") actionName = "Từ chối";
    if (
      newStatus === "AVAILABLE" &&
      products.find((p) => p._id === productId)?.status === "LOCKED"
    )
      actionName = "Mở khóa";

    if (!window.confirm(`Bạn có chắc chắn muốn ${actionName} sản phẩm này?`))
      return;

    try {
      await API.put(`/products/admin/${productId}/status`, {
        status: newStatus,
      });

      toast.success(`Đã ${actionName} sản phẩm thành công!`);

      fetchProducts();
    } catch (error) {
      console.error("Lỗi update status:", error);
      toast.error(
        error.response?.data?.message || "Lỗi khi cập nhật trạng thái",
      );
    }
  };

  return {
    products,
    loading,
    filters,
    setFilters,
    handleUpdateStatus,
  };
}

export default useAdminProduct;

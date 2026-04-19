import { API } from "@/services/axios";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

function useAdminProduct() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
  });

  const fetchProducts = useCallback(
    async (page = 1) => {
      setLoading(true);

      try {
        const response = await API.get("products/admin/all", {
          params: { ...filters, page, limit: 15 },
        });

        setProducts(response.data.products || []);

        setPagination({
          currentPage: response.data.currentPage || 1,
          totalPages: response.data.totalPages || 1,
        });
      } catch (error) {
        console.error("Lỗi fetchProducts:", error);
        toast.error("Không thể tải danh sách sản phẩm!");
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  // Kỹ thuật Debounce: Chờ Admin gõ xong 500ms (nửa giây) thì mới gọi API
  useEffect(() => {
    const delayTimer = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(delayTimer);
  }, [fetchProducts]); // Lắng nghe sự thay đổi của biến filters

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
    pagination,
    fetchProducts,
  };
}

export default useAdminProduct;

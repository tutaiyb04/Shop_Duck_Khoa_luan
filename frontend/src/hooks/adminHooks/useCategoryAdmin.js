import { API } from "@/services/axios";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

function useCategoryAdmin() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [parentCategoriesForModal, setParentCategoriesForModal] = useState([]);

  const fetchCategories = useCallback(async (page = 1, type = "parent") => {
    try {
      setIsLoading(true);
      const res = await API.get("/categories/admin/all", {
        params: { page, limit: 15, type },
      });

      setCategories(res.data.category || []);
      setPagination({
        currentPage: res.data.currentPage || 1,
        totalPages: res.data.totalPages || 1,
      });
    } catch (error) {
      console.log("Lỗi khi load danh mục: ", error);
      toast.error("Không thể tải danh sách danh mục");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAllParentsForModal = useCallback(async () => {
    try {
      const res = await API.get("/categories/admin/parents-all");
      setParentCategoriesForModal(res.data.category || []);
    } catch (error) {
      console.log("Lỗi load danh mục cha cho Modal", error);
    }
  }, []);

  useEffect(() => {
    fetchAllParentsForModal();
  }, [fetchAllParentsForModal]);

  const handleCreate = async (data, currentViewMode) => {
    try {
      await API.post("/categories/create-category", data);
      toast.success("Thêm danh mục mới thành công");
      fetchCategories(1, currentViewMode); // Reload về trang 1 của tab hiện tại
      fetchAllParentsForModal();
    } catch (error) {
      console.log("Lỗi khi tạo danh mục: ", error);
      toast.error(error.response?.data?.message || "Lỗi khi tạo danh mục");
    }
  };

  const handleUpdate = async (id, data, currentViewMode) => {
    try {
      await API.put(`/categories/update-category/${id}`, data);
      toast.success("Cập nhật thành công");
      fetchCategories(pagination.currentPage, currentViewMode);
      fetchAllParentsForModal();
    } catch (error) {
      console.log("Lỗi khi sửa danh mục: ", error);
      toast.error("Lỗi khi cập nhật danh mục");
    }
  };

  const handleDelete = async (id, currentViewMode) => {
    if (window.confirm("Bạn có chắc chắn muốn ẩn danh mục này?")) {
      try {
        await API.delete(`/categories/delete-category/${id}`);
        toast.success("Đã ẩn danh mục");
        fetchCategories(pagination.currentPage, currentViewMode);
      } catch (error) {
        console.log("Lỗi khi xóa danh mục: ", error);
        toast.error("Lỗi khi xóa danh mục");
      }
    }
  };

  return {
    categories,
    isLoading,
    pagination,
    parentCategoriesForModal,
    fetchCategories,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}

export default useCategoryAdmin;

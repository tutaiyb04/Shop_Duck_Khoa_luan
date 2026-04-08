import { useState, useEffect } from "react";
import { API } from "@/services/axios";
import toast from "react-hot-toast";

export function useAdminCategory() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Lấy tất cả danh mục (Cả active và hidden)
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await API.get("/categories/admin/all");
      setCategories(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi tải dữ liệu danh mục");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. Tạo mới danh mục
  const createCategory = async (data, onSuccess) => {
    try {
      await API.post("/categories/create", data);
      toast.success("Thêm danh mục thành công!");
      fetchCategories();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi tạo danh mục");
    }
  };

  // 3. Cập nhật danh mục
  const updateCategory = async (id, data, onSuccess) => {
    try {
      await API.put(`/categories/${id}`, data);
      toast.success("Cập nhật thành công!");
      fetchCategories();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật danh mục");
    }
  };

  // 4. Khóa danh mục (Xóa mềm)
  const deleteCategory = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn khóa (ẩn) danh mục này?"))
      return;
    try {
      await API.delete(`/categories/${id}`);
      toast.success("Khóa danh mục thành công!");
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi khóa danh mục");
    }
  };

  // 5. Khôi phục danh mục
  const restoreCategory = async (id) => {
    if (!window.confirm("Bạn muốn hiển thị lại danh mục này cho người dùng?"))
      return;
    try {
      await API.put(`/categories/${id}/restore`);
      toast.success("Khôi phục danh mục thành công!");
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khôi phục danh mục");
    }
  };

  return {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    restoreCategory,
  };
}

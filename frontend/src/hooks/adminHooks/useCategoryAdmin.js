import { API } from "@/services/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function useCategoryAdmin() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await API.get("/categories/admin/all");
      // Backend trả về key 'category'
      setCategories(res.data.category || []);
    } catch (error) {
      console.log("Lỗi khi load danh mục: ", error);
      toast.error("Không thể tải danh sách danh mục");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (data) => {
    try {
      await API.post("/categories/create-category", data);
      toast.success("Thêm danh mục mới thành công");
      fetchCategories();
    } catch (error) {
      console.log("Lỗi khi tạo danh mục: ", error);
      toast.error(error.response?.data?.message || "Lỗi khi tạo danh mục");
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await API.put(`/categories/update-category/${id}`, data);
      toast.success("Cập nhật thành công");
      fetchCategories();
    } catch (error) {
      console.log("Lỗi khi sửa danh mục: ", error);
      toast.error("Lỗi khi cập nhật danh mục");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn ẩn danh mục này?")) {
      try {
        await API.delete(`/categories/delete-category/${id}`);
        toast.success("Đã ẩn danh mục");
        fetchCategories();
      } catch (error) {
        console.log("Lỗi khi xóa danh mục: ", error);
        toast.error("Lỗi khi xóa danh mục");
      }
    }
  };

  return { categories, isLoading, handleCreate, handleUpdate, handleDelete };
}

export default useCategoryAdmin;

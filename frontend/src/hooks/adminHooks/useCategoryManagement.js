import { useState } from "react";
import useCategoryAdmin from "./useCategoryAdmin";

function useCategoryManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // 2. Lấy các hàm gọi API từ hook cũ
  const { categories, isLoading, handleCreate, handleUpdate, handleDelete } =
    useCategoryAdmin();

  // 3. Xử lý dữ liệu phái sinh (Danh mục cha)
  const parentCategories = categories.filter((cat) => !cat.parentId);

  // 4. Các hàm điều khiển Giao diện (Event Handlers)
  const openCreateModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const onFormSubmit = async (formData) => {
    if (editingCategory) {
      await handleUpdate(editingCategory._id, formData);
    } else {
      await handleCreate(formData);
    }
  };

  // 5. Trả ra "đồ nghề" cho file giao diện sử dụng
  return {
    categories,
    parentCategories,
    isLoading,
    isModalOpen,
    editingCategory,
    openCreateModal,
    openEditModal,
    closeModal,
    onFormSubmit,
    handleDelete,
  };
}

export default useCategoryManagement;

import { useEffect, useState } from "react";
import useCategoryAdmin from "./useCategoryAdmin";

function useCategoryManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewMode, setViewMode] = useState("parent");

  const {
    categories,
    isLoading,
    pagination,
    parentCategoriesForModal,
    fetchCategories,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useCategoryAdmin();

  useEffect(() => {
    fetchCategories(1, viewMode);
  }, [viewMode, fetchCategories]);

  // Các hàm điều khiển Giao diện (Event Handlers)
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
    // Truyền thêm viewMode để hook kia load lại đúng tab sau khi thêm/sửa
    if (editingCategory) {
      await handleUpdate(editingCategory._id, formData, viewMode);
    } else {
      await handleCreate(formData, viewMode);
    }
    closeModal();
  };

  const onDelete = async (id) => {
    await handleDelete(id, viewMode);
  };

  // 5. Trả ra "đồ nghề" cho file giao diện sử dụng
  return {
    categories,
    isLoading,
    pagination,
    isModalOpen,
    editingCategory,
    viewMode,
    parentCategoriesForModal,
    setViewMode,
    fetchCategories,
    openCreateModal,
    openEditModal,
    closeModal,
    onFormSubmit,
    handleDelete: onDelete,
  };
}

export default useCategoryManagement;

import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Trash2 } from "lucide-react";
import useCategoryManagement from "@/hooks/adminHooks/useCategoryManagement";
import CategoryFormModal from "@/components/admin/categoryManagement/CategoryFormModal";
import CategoryTable from "@/components/admin/categoryManagement/CategoryTable";

function CategoryManagement() {
  // GỌI HOOK LẤY LOGIC
  const {
    categories,
    parentCategories,
    childCategories,
    isLoading,
    isModalOpen,
    editingCategory,
    viewMode,
    setViewMode,
    openCreateModal,
    openEditModal,
    closeModal,
    onFormSubmit,
    handleDelete,
  } = useCategoryManagement();

  // Hiển thị trạng thái tải dữ liệu
  if (isLoading && categories.length === 0)
    return (
      <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
    );

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      {/* HEADER BẢNG */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-yellow-600">
          Quản lý danh mục
        </h1>
        {/* Nhóm Nút & Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Nút Chọn Dropdown để chuyển bảng */}
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="w-full sm:w-auto h-10 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 cursor-pointer shadow-sm transition-colors"
          >
            <option value="parent">Danh mục chính (Gốc)</option>
            <option value="child">Danh mục phụ (Con)</option>
          </select>

          <Button
            onClick={openCreateModal}
            className="w-full sm:w-auto !bg-yellow-500 hover:!bg-yellow-600 text-white shadow-sm !border-0 !ring-0 !outline-none"
          >
            <Plus className="w-4 h-4 mr-2" /> Thêm danh mục
          </Button>
        </div>
      </div>

      {/* BẢNG HIỂN THỊ DANH SÁCH */}
      {viewMode === "parent" ? (
        <CategoryTable
          type="parent"
          categories={parentCategories}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      ) : (
        /* KHI CHỌN DANH MỤC PHỤ  */

        <CategoryTable
          type="child"
          categories={childCategories}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      )}

      {/* TÍCH HỢP MODAL */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        editingCategory={editingCategory}
        onSubmit={onFormSubmit}
        parentCategories={parentCategories}
      />
    </div>
  );
}

export default CategoryManagement;

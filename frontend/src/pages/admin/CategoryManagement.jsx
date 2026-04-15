import CategoryFormModal from "@/components/admin/CategoryFormModal";
import useCategoryAdmin from "@/hooks/adminHooks/useCategoryAdmin";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

function CategoryManagement() {
  // State quản lý Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const { categories, isLoading, handleCreate, handleUpdate, handleDelete } =
    useCategoryAdmin();

  // Hàm mở Modal để Thêm mới
  const openCreateModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  // Hàm mở Modal để Sửa
  const openEditModal = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  // Hàm nhận dữ liệu từ Modal Form trả về
  const onFormSubmit = async (formData) => {
    if (editingCategory) {
      // Nếu có editingCategory -> Gọi API Sửa
      await handleUpdate(editingCategory._id, formData);
    } else {
      // Nếu không có -> Gọi API Thêm mới
      await handleCreate(formData);
    }
  };

  const renderIcon = (iconName) => {
    if (iconName?.length <= 2) {
      return <span className="text-2xl">{iconName}</span>;
    }

    const cleanName = iconName?.replace(/[<>/\s]/g, "");

    const IconComponent = LucideIcons[cleanName] || LucideIcons.Box;
    return <IconComponent className="w-6 h-6 text-gray-600" />;
  };

  if (isLoading && categories.length === 0)
    return <div className="p-8">Đang tải dữ liệu...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-yellow-500">Quản lý danh mục</h1>
        <Button
          onClick={openCreateModal}
          className="!bg-yellow-500 hover:!bg-yellow-700 text-white !border-0 !ring-0 !outline-none"
        >
          <Plus className="w-4 h-4 mr-2" /> Thêm danh mục
        </Button>
      </div>

      {/* Bảng hiển thị danh sách */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 text-left font-semibold text-gray-600 w-16">
                Icon
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Tên danh mục
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Mô tả
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Slug
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Trạng thái
              </th>
              <th className="p-4 text-center font-semibold text-gray-600 w-32">
                Hành động
              </th>
            </tr>
          </thead>

          <tbody>
            {categories.map((cat) => (
              <tr
                key={cat._id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="p-4 text-2xl">{renderIcon(cat.icon)}</td>
                <td className="p-4 font-medium text-gray-800">{cat.name}</td>
                <td className="p-4 text-sm text-gray-600 max-w-xs truncate">
                  {cat.description || (
                    <span className="text-gray-400 italic">Không có mô tả</span>
                  )}
                </td>
                <td className="p-4 text-sm text-gray-500">{cat.slug}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      cat.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {cat.status === "active" ? "Hoạt động" : "Đã ẩn"}
                  </span>
                </td>
                <td className="p-4 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(cat)}
                  >
                    <Edit className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(cat._id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  Chưa có danh mục nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tích hợp Component Modal Form */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingCategory={editingCategory}
        onSubmit={onFormSubmit}
      />
    </div>
  );
}

export default CategoryManagement;

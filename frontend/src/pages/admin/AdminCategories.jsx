import React, { useState } from "react";
import { useAdminCategory } from "@/hooks/adminHooks/useAdminCategory";
import {
  Plus,
  Edit,
  Trash2,
  RefreshCcw,
  Image as ImageIcon,
} from "lucide-react";

export default function AdminCategories() {
  const {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    restoreCategory,
  } = useAdminCategory();

  // Trạng thái Tab hiện tại
  const [activeTab, setActiveTab] = useState("active"); // "active" hoặc "hidden"

  // Trạng thái Modal (Popup form)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedCategory, setSelectedCategory] = useState({
    name: "",
    icon: "",
    description: "",
  });

  // Lọc danh mục theo Tab đang chọn
  const filteredCategories = categories.filter(
    (cat) => cat.status === activeTab,
  );

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedCategory({ name: "", icon: "", description: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setModalMode("edit");
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === "create") {
      createCategory(selectedCategory, () => setIsModalOpen(false));
    } else {
      updateCategory(selectedCategory._id, selectedCategory, () =>
        setIsModalOpen(false),
      );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[80vh]">
      {/* Header trang */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Danh mục</h1>
          <p className="text-sm text-gray-500 mt-1">
            Phân loại và điều hướng sản phẩm trên hệ thống
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition shadow-sm"
        >
          <Plus size={18} /> Thêm Danh Mục
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-6 pt-4 space-x-6 border-b border-gray-100">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-3 font-medium transition-colors ${
            activeTab === "active"
              ? "text-amber-600 border-b-2 border-amber-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Đang Hoạt Động
        </button>
        <button
          onClick={() => setActiveTab("hidden")}
          className={`pb-3 font-medium transition-colors ${
            activeTab === "hidden"
              ? "text-red-600 border-b-2 border-red-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Thùng Rác / Đã Ẩn
        </button>
      </div>

      {/* Bảng dữ liệu (Table) */}
      <div className="p-6 overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                <th className="py-3 px-4 font-medium w-1/3">Tên Danh Mục</th>
                <th className="py-3 px-4 font-medium w-1/3">
                  Slug (Đường dẫn)
                </th>
                <th className="py-3 px-4 font-medium text-center">Icon</th>
                <th className="py-3 px-4 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-400">
                    Không có dữ liệu trong mục này
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr
                    key={cat._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4 font-medium text-gray-800">
                      {cat.name}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-sm">
                      {cat.slug}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block p-2 bg-gray-100 rounded text-gray-600">
                        {cat.icon || <ImageIcon size={18} />}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {activeTab === "active" ? (
                          <>
                            <button
                              onClick={() => openEditModal(cat)}
                              className="text-blue-500 hover:text-blue-700 p-1 bg-blue-50 rounded"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => deleteCategory(cat._id)}
                              className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => restoreCategory(cat._id)}
                            className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm font-medium bg-green-50 px-2 py-1 rounded"
                          >
                            <RefreshCcw size={16} /> Khôi phục
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {modalMode === "create"
                ? "Thêm Danh Mục Mới"
                : "Cập Nhật Danh Mục"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={selectedCategory.name}
                  onChange={(e) =>
                    setSelectedCategory({
                      ...selectedCategory,
                      name: e.target.value,
                    })
                  }
                  placeholder="Ví dụ: Điện thoại & Phụ kiện"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Icon (Lucide-React)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={selectedCategory.icon || ""}
                  onChange={(e) =>
                    setSelectedCategory({
                      ...selectedCategory,
                      icon: e.target.value,
                    })
                  }
                  placeholder="Ví dụ: Smartphone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả chi tiết
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={selectedCategory.description || ""}
                  onChange={(e) =>
                    setSelectedCategory({
                      ...selectedCategory,
                      description: e.target.value,
                    })
                  }
                  placeholder="Mô tả nhóm hàng..."
                  rows="3"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition"
                >
                  {modalMode === "create" ? "Tạo danh mục" : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

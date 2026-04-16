import CategoryFormModal from "@/components/admin/CategoryFormModal";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Trash2 } from "lucide-react";
import useCategoryManagement from "@/hooks/adminHooks/useCategoryManagement";

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

  // Hàm render giao diện Icon
  const renderIcon = (iconName) => {
    if (iconName?.length <= 2) {
      return <span className="text-2xl">{iconName}</span>;
    }
    const cleanName = iconName?.replace(/[<>/\s]/g, "");
    const IconComponent = LucideIcons[cleanName] || LucideIcons.Box;
    return <IconComponent className="w-6 h-6 text-gray-600" />;
  };

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
        <div className="animate-in fade-in duration-300">
          <h2 className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-yellow-500 pl-3">
            Danh mục chính (Gốc)
          </h2>
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full border-collapse text-sm sm:text-base">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-3 sm:p-4 text-left font-semibold text-gray-600 whitespace-nowrap">
                    Icon
                  </th>
                  <th className="p-3 sm:p-4 text-left font-semibold text-gray-600 whitespace-nowrap">
                    Tên danh mục
                  </th>
                  <th className="p-3 sm:p-4 text-left font-semibold text-gray-600 whitespace-nowrap">
                    Mô tả
                  </th>
                  <th className="p-3 sm:p-4 text-left font-semibold text-gray-600 whitespace-nowrap">
                    Slug
                  </th>
                  <th className="p-3 sm:p-4 text-left font-semibold text-gray-600 whitespace-nowrap">
                    Trạng thái
                  </th>
                  <th className="p-3 sm:p-4 text-center font-semibold text-gray-600 whitespace-nowrap">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {parentCategories.map((cat) => (
                  <tr
                    key={cat._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 sm:p-4 text-xl sm:text-2xl">
                      {renderIcon(cat.icon)}
                    </td>
                    <td className="p-3 sm:p-4 font-semibold text-gray-800 whitespace-nowrap">
                      {cat.name}
                    </td>
                    <td className="p-3 sm:p-4 text-gray-600 min-w-[150px] max-w-[200px] truncate">
                      {cat.description || (
                        <span className="text-gray-400 italic text-xs">
                          Không có mô tả
                        </span>
                      )}
                    </td>
                    <td className="p-3 sm:p-4 text-gray-500 whitespace-nowrap">
                      {cat.slug}
                    </td>
                    <td className="p-3 sm:p-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 text-[11px] sm:text-xs font-bold rounded-full uppercase tracking-wider ${
                          cat.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {cat.status === "active" ? "Hoạt động" : "Đã ẩn"}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 flex justify-center gap-2 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(cat)}
                        className="h-8 w-8 p-0 hover:!bg-gray-200 !border-1 !border-gray-200 !ring-0 !outline-none"
                      >
                        <Edit className="w-4 h-4 text-blue-600 " />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(cat._id)}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200 hover:!bg-gray-200 !border-1 !border-gray-200 !ring-0 !outline-none"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}

                {parentCategories.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      Chưa có danh mục chính nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ================= KHI CHỌN DANH MỤC PHỤ ================= */
        <div className="animate-in fade-in duration-300">
          <h2 className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-blue-500 pl-3">
            Danh mục phụ (Con)
          </h2>
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full border-collapse text-sm sm:text-base">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-3 sm:p-4 text-left font-semibold text-gray-600 whitespace-nowrap">
                    Icon
                  </th>
                  <th className="p-3 sm:p-4 text-left font-semibold text-gray-600 whitespace-nowrap">
                    Tên danh mục
                  </th>
                  <th className="p-3 sm:p-4 text-left font-semibold text-gray-600 whitespace-nowrap">
                    Thuộc danh mục
                  </th>
                  <th className="p-3 sm:p-4 text-left font-semibold text-gray-600 whitespace-nowrap">
                    Mô tả
                  </th>
                  <th className="p-3 sm:p-4 text-left font-semibold text-gray-600 whitespace-nowrap">
                    Slug
                  </th>
                  <th className="p-3 sm:p-4 text-left font-semibold text-gray-600 whitespace-nowrap">
                    Trạng thái
                  </th>
                  <th className="p-3 sm:p-4 text-center font-semibold text-gray-600 whitespace-nowrap">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {childCategories.map((cat) => (
                  <tr
                    key={cat._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 sm:p-4 text-xl sm:text-2xl">
                      {renderIcon(cat.icon)}
                    </td>
                    <td className="p-3 sm:p-4 font-semibold text-gray-800 whitespace-nowrap">
                      {cat.name}
                    </td>
                    <td className="p-3 sm:p-4 whitespace-nowrap">
                      <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-xs font-semibold border border-blue-100">
                        {cat.parentId?.name || "Lỗi tham chiếu"}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 text-gray-600 min-w-[150px] max-w-[200px] truncate">
                      {cat.description || (
                        <span className="text-gray-400 italic text-xs">
                          Không có mô tả
                        </span>
                      )}
                    </td>
                    <td className="p-3 sm:p-4 text-gray-500 whitespace-nowrap">
                      {cat.slug}
                    </td>
                    <td className="p-3 sm:p-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 text-[11px] sm:text-xs font-bold rounded-full uppercase tracking-wider ${
                          cat.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {cat.status === "active" ? "Hoạt động" : "Đã ẩn"}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 flex justify-center gap-2 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(cat)}
                        className="h-8 w-8 p-0 hover:!bg-gray-200 !border-1 !border-gray-200 !ring-0 !outline-none"
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(cat._id)}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200 hover:!bg-gray-200 !border-1 !border-gray-200 !ring-0 !outline-none"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}

                {childCategories.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">
                      Chưa có danh mục phụ nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
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

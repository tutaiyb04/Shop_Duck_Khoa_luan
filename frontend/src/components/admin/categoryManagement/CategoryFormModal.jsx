import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { Button } from "../../ui/button";
import { useCategoryForm } from "@/hooks/adminHooks/useCategoryForm";

function CategoryFormModal({
  isOpen,
  onClose,
  editingCategory,
  onSubmit,
  parentCategories,
}) {
  // GỌI HOOK LOGIC VÀ LẤY ĐỒ NGHỀ RA DÙNG
  const { register, handleSubmit, errors, isSubmitting, handleFormSubmit } =
    useCategoryForm(isOpen, editingCategory, onSubmit, onClose);

  // Nếu Modal đang đóng thì không render gì cả
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-5 sm:p-6 relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        {/* Nút tắt Modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-200 rounded-full p-1.5 transition-colors"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold mb-5 text-yellow-600 pr-8">
          {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        </h2>

        {/* BẮT ĐẦU FORM */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Tên danh mục */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Tên danh mục
            </label>
            <Input
              {...register("name")}
              placeholder="VD: Điện thoại, Laptop..."
              className="focus-visible:ring-yellow-500"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1.5">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Biểu tượng (Icon/Emoji)
            </label>
            <Input
              {...register("icon")}
              placeholder="VD: 📱, 💻, Smartphone..."
              className="focus-visible:ring-yellow-500"
            />
          </div>

          {/* Chọn danh mục cha */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Danh mục cha
            </label>
            <select
              {...register("parentId")}
              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="">-- Không có (Đây là danh mục gốc) --</option>
              {parentCategories?.map(
                (cat) =>
                  editingCategory?._id !== cat._id && (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ),
              )}
            </select>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Mô tả chi tiết
            </label>
            <Textarea
              {...register("description")}
              placeholder="Mô tả ngắn về danh mục này..."
              className="focus-visible:ring-yellow-500 resize-none"
              rows={3}
            />
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Trạng thái
            </label>
            <select
              {...register("status")}
              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="active">Hoạt động (Hiển thị cho khách)</option>
              <option value="hidden">Đã ẩn (Chỉ Admin thấy)</option>
            </select>
          </div>

          {/* Nhóm nút Hủy / Lưu */}
          <div className="flex justify-end gap-3 pt-5 border-t border-gray-100 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto !bg-yellow-500 hover:!bg-yellow-600 text-white shadow-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "Lưu danh mục"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryFormModal;

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "../ui/button";

const categorySchema = z.object({
  name: z.string().min(2, { message: "Tên danh mục phải có ít nhất 2 ký tự" }),
  icon: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
});
function CategoryFormModal({ isOpen, onClose, editingCategory, onSubmit }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      icon: "",
      description: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (editingCategory) {
      reset({
        name: editingCategory.name || "",
        icon: editingCategory.icon || "",
        description: editingCategory.description || "",
        status: editingCategory.status || "active",
      });
    } else {
      reset({ name: "", icon: "", description: "" }); // Xóa trắng nếu là "Thêm mới"
    }
  }, [editingCategory, reset, isOpen]);

  const handleFormSubmit = async (data) => {
    await onSubmit(data); // Gọi hàm onSubmit từ component cha truyền vào
    onClose(); // Đóng modal sau khi thành công
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-5 sm:p-6 relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-200 rounded-full p-1.5 transition-colors !border !border-gray-200 hover:!bg-gray-200 !ring-0 !outline-none"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold mb-5 text-yellow-600 pr-8">
          {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        </h2>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
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

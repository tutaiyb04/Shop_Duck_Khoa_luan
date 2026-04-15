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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-amber-50 transition-colors">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 !border !border-gray-200 hover:!bg-gray-200 !ring-0 !outline-none"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-4 text-yellow-500">
          {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        </h2>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên danh mục
            </label>
            <Input
              {...register("name")}
              placeholder="VD: Điện thoại, Laptop..."
              className="!ring-0 focus-visible:border-yellow-500"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Biểu tượng (Icon/Emoji)
            </label>
            <Input
              {...register("icon")}
              placeholder="VD: 📱, 💻, fa-mobile..."
              className="!ring-0 focus-visible:border-yellow-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả chi tiết
            </label>
            <Textarea
              {...register("description")}
              placeholder="Mô tả ngắn về danh mục này..."
              className="!ring-0 focus-visible:border-yellow-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              {...register("status")}
              className="w-full flex h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
            >
              <option value="active">Hoạt động (Hiển thị cho khách)</option>
              <option value="hidden">Đã ẩn (Chỉ Admin thấy)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="!border !border-gray-200 hover:!bg-gray-200  !ring-0 !outline-none"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="!bg-yellow-600 hover:!bg-yellow-700 text-white !border !border-yellow-500 !ring-0 !outline-none"
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

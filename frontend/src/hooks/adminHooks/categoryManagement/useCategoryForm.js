import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// 1. Khai báo quy tắc kiểm tra dữ liệu (Validation Schema)
const categorySchema = z.object({
  name: z.string().min(2, { message: "Tên danh mục phải có ít nhất 2 ký tự" }),
  icon: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  parentId: z.string().optional().nullable(),
});

export function useCategoryForm(isOpen, editingCategory, onSubmit, onClose) {
  // 2. Khởi tạo Hook quản lý Form
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
      parentId: "",
    },
  });

  // 3. Logic tự động điền dữ liệu khi Admin bấm nút "Sửa" hoặc xóa trắng khi "Thêm mới"
  useEffect(() => {
    if (editingCategory) {
      reset({
        name: editingCategory.name || "",
        icon: editingCategory.icon || "",
        description: editingCategory.description || "",
        status: editingCategory.status || "active",
        parentId:
          editingCategory.parentId?._id || editingCategory.parentId || "",
      });
    } else {
      reset({
        name: "",
        icon: "",
        description: "",
        status: "active",
        parentId: "",
      });
    }
  }, [editingCategory, reset, isOpen]);

  // 4. Logic đóng Modal ngay sau khi submit thành công
  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    onClose();
  };

  // 5. Trả "đồ nghề" ra cho file UI
  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    handleFormSubmit,
  };
}

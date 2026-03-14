import { AuthContext } from "@/context/AuthContext";
import { API } from "@/services/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";

const profileSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Tên hiển thị phải có ít nhất 3 ký tự" }),
  phone: z.string().optional(),
  address: z.string().optional(),
});
function useProfile() {
  const { user, login } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // Lưu trữ file ảnh được chọn
  const [previewImage, setPreviewImage] = useState(null); // Hiển thị ảnh tạm thời
  const [isLoadingData, setIsLoadingData] = useState(true);

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: "", phone: "", address: "" },
  });

  // Sử dụng useEffect để gọi API ngay khi vào trang
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get("user/profile");
        const freshUser = response.data.user;

        // Điền dữ liệu mới nhất lấy từ Server vào Form
        form.reset({
          username: freshUser.username || "",
          phone: freshUser.phone || "",
          address: freshUser.address || "",
        });
        setPreviewImage(freshUser.avatar);

        // (Tùy chọn) Cập nhật lại Context nếu bạn muốn đồng bộ toàn hệ thống
        login({ token: localStorage.getItem("token"), user: freshUser });
      } catch (error) {
        console.error("Lỗi khi tải thông tin:", error);
        toast.error("Không thể tải thông tin cá nhân!");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchProfile();
  }, []);

  // Nhận file từ component AvatarUpload truyền lên
  const handleImageSelect = (file) => {
    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const onSubmit = async (values) => {
    setIsLoading(true);

    try {
      // khởi tạo formData
      const formData = new FormData();
      formData.append("username", values.username);
      if (values.phone) formData.append("phone", values.phone);
      if (values.address) formData.append("address", values.address);

      // Nếu có chọn ảnh mới thì đính kèm vào với key là 'avatar'
      if (selectedImage) {
        formData.append("avatar", selectedImage);
      }

      // gọi API với header cho formData
      const response = await API.put("user/update-profile", formData);

      toast.success("Cập nhật thành công");
      login({ token: localStorage.getItem("token"), user: response.data.user });
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập hết hạn!");
      } else {
        toast.error(error.response?.data?.message || "Cập nhật thất bại!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    form,
    isLoading,
    isLoadingData,
    previewImage,
    handleImageSelect,
    onSubmit,
  };
}

export default useProfile;

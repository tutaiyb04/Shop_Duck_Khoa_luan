import { AuthContext } from "@/context/AuthContext";
import { API } from "@/services/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";

const sellerProfileSchema = z.object({
  storeName: z
    .string()
    .max(120, { message: "Tên gian hàng tối đa 120 ký tự" }),
  description: z.string().max(2000, { message: "Tối đa 2000 ký tự" }),
});

function useSellerProfile() {
  const { user, login } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const form = useForm({
    resolver: zodResolver(sellerProfileSchema),
    defaultValues: { storeName: "", description: "" },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get("user/profile");
        const user = response.data.user;

        form.reset({
          storeName: user.sellerProfile?.storeName || "",
          description: user.sellerProfile?.description || user.description || "",
        });

        setPreviewImage(user.avatar);

        login({ token: localStorage.getItem("token"), user: user });
      } catch (error) {
        console.error("Lỗi khi tải thông tin người bán:", error);
        toast.error("Không thể tải thông tin gian hàng!");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchProfile();
  }, []);

  const handleImageSelect = (file) => {
    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("storeName", values.storeName ?? "");
      formData.append("description", values.description ?? "");
      if (selectedImage) {
        formData.append("avatar", selectedImage);
      }

      const response = await API.put("user/update-profile", formData);

      const nextUser = response.data.user;

      toast.success("Đã cập nhật thông tin gian hàng");
      
      setSelectedImage(null);
      login({ token: localStorage.getItem("token"), user: nextUser });
    } catch (error) {
      console.error("Lỗi cập nhật gian hàng:", error);
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

export default useSellerProfile;

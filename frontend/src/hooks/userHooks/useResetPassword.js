import { API } from "@/services/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import * as z from "zod";

const confirmResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "Vui lòng nhập tối thiểu 6 ký tự!" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp!",
    path: ["confirmPassword"],
  });

function useResetPassword() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigate();

  const getToken = searchParams.get("token");

  const form = useForm({
    resolver: zodResolver(confirmResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values) => {
    setError("");
    setIsLoading(true);

    try {
      const payload = {
        token: getToken,
        newPassword: values.password,
      };

      // eslint-disable-next-line no-unused-vars
      const response = await API.post("user/reset-password", payload);
      setTimeout(() => {
        navigation("/login");
      }, 1500);

      setIsSuccess(true);

      toast.success("Đã đặt lại mật khẩu thành công");
    } catch (error) {
      console.log("Chi tiết lỗi catch: ", error);
      setError(
        error.response?.data?.message ||
          "Đặt lại mật khẩu thất bại. Vui lòng thử lại!",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    error,
    isLoading,
    isSuccess,
    onSubmit,
  };
}

export default useResetPassword;

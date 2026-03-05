import { API } from "@/services/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Vui lòng nhập email!" })
    .email("Email không đúng định dạng!"),
});

function useForgotPassword() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    setError("");

    try {
      const payload = {
        email: values.email,
      };
      // eslint-disable-next-line no-unused-vars
      const response = await API.post("user/forgot-password", payload);

      setIsSuccess(true);

      toast.success("Vui lòng kiểm tra hộp thư của bạn!");
    } catch (error) {
      console.log("Chi tiết lỗi catch được: ", error);
      setError(
        error.response?.data?.message ||
          "Gửi email thất bại. Vui lòng thử lại!",
      );
      toast.error("Email không tồn tại!");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    error,
    isLoading,
    isSuccess,
    form,
    onSubmit,
  };
}

export default useForgotPassword;

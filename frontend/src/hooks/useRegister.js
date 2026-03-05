import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { API } from "@/services/axios";
import toast from "react-hot-toast";
import * as z from "zod";

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Vui lòng nhập tối thiểu 3 ký tự!" }),
    email: z
      .string()
      .min(1, { message: "Vui lòng nhập email!" })
      .email("Email không đúng định dạng!"),
    password: z
      .string()
      .min(6, { message: "Vui lòng nhập tối thiểu 6 ký tự!" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp!",
    path: ["confirmPassword"],
  });
function useRegister() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    setError("");

    try {
      const payload = {
        username: values.username,
        email: values.email,
        password: values.password,
      };

      // eslint-disable-next-line no-unused-vars
      const response = await API.post("user/register", payload);

      toast.success("Đăng ký tài khoản thành công");

      navigate("/login");
    } catch (error) {
      console.log("Chi tiết lỗi catch được: ", error);
      setError(
        error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại!",
      );
      toast.success("Đăng ký tài khoản thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    error,
    isLoading,
    onSubmit,
  };
}

export default useRegister;

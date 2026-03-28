import { useContext, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { API } from "@/services/axios";
import * as z from "zod";
import toast from "react-hot-toast";

// Cập nhập Zod
const loginSchema = z.object({
  identifier: z
    .string()
    .min(3, { message: "Vui lòng nhập ít nhất 3 ký tự!" })
    .regex(/^\S+$/, { message: "Không được có khoảng trắng" }),
  password: z
    .string()
    .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự!" })
    .regex(/^\S+$/, { message: "Không được có khoảng trắng" }),
});
function useLogin() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    setError("");

    localStorage.removeItem("token");

    try {
      const payload = {
        username: values.identifier,
        email: values.identifier,
        password: values.password,
      };

      const response = await API.post("user/login", payload);

      login(response.data);
      navigate("/");
      toast.success("Đăng nhập thành công");
    } catch (error) {
      console.error("Chi tiết lỗi catch được:", error);
      setError(
        error.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng thử lại!",
      );
      toast.error("Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    error,
    isLoading,
    form,
    onSubmit,
  };
}

export default useLogin;

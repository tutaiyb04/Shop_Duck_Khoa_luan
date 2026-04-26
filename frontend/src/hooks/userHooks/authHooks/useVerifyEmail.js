/* eslint-disable react-hooks/set-state-in-effect */
import { API } from "@/services/axios";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export function useVerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Lấy token từ thanh URL
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); // 3 trạng thái: 'loading', 'success', 'error'
  const [message, setMessage] = useState("");

  // Dùng useRef để tránh việc useEffect gọi API 2 lần (đặc tính của React StrictMode)
  const isCalled = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Đường dẫn xác minh không hợp lệ hoặc thiếu mã token.");
      return;
    }

    const verifyToken = async () => {
      if (isCalled.current) return;
      isCalled.current = true;

      try {
        const res = await API.post("/user/verify-email", { token });
        setStatus("success");
        setMessage(res.data.message || "Xác minh Email thành công!");
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Xác minh thất bại. Link có thể đã hết hạn.",
        );
        console.log("Lỗi khi xác minh tài khoản: ", error);
      }
    };

    verifyToken();
  }, [token]);

  return { status, message, navigate };
}

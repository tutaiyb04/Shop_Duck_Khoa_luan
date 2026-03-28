import { API } from "@/services/axios";
import { auth } from "@/config/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import toast from "react-hot-toast";

function useLoginPhone() {
  const [confirmResult, setConfirmResult] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);

  const { login } = useContext(AuthContext);
  const navigation = useNavigate();

  const handleSendOtp = async (phoneNumber) => {
    try {
      // dọn dẹp reCAPTCHA cũ (nếu có)
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      // khởi tạo reCAPTCHA mới
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        },
      );

      // gửi SMS cho người dùng
      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        window.recaptchaVerifier,
      );
      setConfirmResult(confirmation);
      setIsOtpSent(true);
      console.log("Đã gửi SMS thành công!");
    } catch (error) {
      console.log("Lỗi catch được: ", error);
      toast.error("Gửi mã OTP thất bại");
    }
  };

  const handleVerifyOtp = async (inputPhone) => {
    try {
      // kiểm tra xem mã otp nhập vào có đúng vs otp đã gửi cho người dùng
      const result = await confirmResult.confirm(otpCode);

      // Ưu tiên lấy số điện thoại người dùng đã nhập, nếu không có mới dùng của Firebase
      const phoneToSend = inputPhone || result.user.phoneNumber;

      // lấy số điện thoại từ UserCredential
      const payload = {
        phone: phoneToSend,
      };

      const respone = await API.post("user/phone-login", payload);

      login(respone.data);
      navigation("/");
      toast.success("Đăng nhập bằng số điện thoại thành công");
    } catch (error) {
      console.log("Lỗi catch được: ", error);
      toast.error("Đăng nhập thất bại");
    }
  };

  return {
    otpCode,
    isOtpSent,
    setOtpCode,
    handleSendOtp,
    handleVerifyOtp,
  };
}

export default useLoginPhone;

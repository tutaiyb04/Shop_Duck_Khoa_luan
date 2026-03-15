import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { NavLink } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import useLogin from "@/hooks/useLogin";
import useLoginGoogle from "@/hooks/useLoginGoogle";
import useLoginFacebook from "@/hooks/useLoginFacebook";
import useLoginPhone from "@/hooks/useLoginPhone";
import logoImage from "@/assets/logo3.png";
import LoginForm from "@/components/auth/LoginForm";
import SocialForm from "@/components/auth/SocialForm";
import PhoneAuthForm from "@/components/auth/PhoneAuthForm";

function Login() {
  const [isPhoneMode, setIsPhoneMode] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const { error, isLoading, form, onSubmit } = useLogin();

  const { onSuccess: onGoogleSuccess } = useLoginGoogle();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: onGoogleSuccess,
  });

  const { onSuccess: onFacebookSuccess } = useLoginFacebook();

  const { isOtpSent, otpCode, setOtpCode, handleSendOtp, handleVerifyOtp } =
    useLoginPhone();

  return (
    <div className="w-full min-h-screen bg-amber-50 flex items-center justify-center py-10 lg:py-0">
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8 px-4">
        {/* Cột Logo */}
        <div className="flex flex-col items-center justify-center h-[100vh] lg:h-auto pb-20 lg:pb-0">
          <img
            src={logoImage}
            alt="Welcome to Duck Shop"
            className="w-full max-w-sm lg:max-w-lg object-contain"
          />
          <div className="absolute bottom-10 animate-bounce lg:hidden text-yellow-600 flex flex-col items-center">
            <span className="text-sm font-medium mb-1">
              Vuốt xuống để đăng nhập
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* Cột Form */}
        <div className="flex flex-col justify-center items-center w-full min-h-[100vh] lg:min-h-0 py-10 lg:py-0">
          <Card className="w-full max-w-md shadow-lg border !border-gray-200 bg-white">
            <CardHeader className="space-y-1 text-center p-6">
              <CardTitle className="text-2xl font-bold text-gray-800">
                Đăng nhập
              </CardTitle>
              <CardDescription className="text-gray-500">
                Chào mừng quay lại hệ thống mua bán Duck Shop
              </CardDescription>
            </CardHeader>

            <CardContent>
              {isPhoneMode ? (
                // Tái sử dụng form Đăng nhập bằng số điện thoại
                <PhoneAuthForm
                  isOtpSent={isOtpSent}
                  phoneNumber={phoneNumber}
                  setPhoneNumber={setPhoneNumber}
                  handleSendOtp={handleSendOtp}
                  otpCode={otpCode}
                  setOtpCode={setOtpCode}
                  handleVerifyOtp={handleVerifyOtp}
                  setIsPhoneMode={setIsPhoneMode}
                />
              ) : (
                <>
                  {/* Form Đăng nhập Email/Username */}
                  <LoginForm
                    form={form}
                    onSubmit={onSubmit}
                    isLoading={isLoading}
                    error={error}
                  />

                  {/* Tái sử dụng các nút mạng xã hội */}
                  <SocialForm
                    handleGoogleLogin={handleGoogleLogin}
                    onFacebookSuccess={onFacebookSuccess}
                    setIsPhoneMode={setIsPhoneMode}
                  />
                </>
              )}
            </CardContent>

            <NavLink
              to="/register"
              className="flex justify-center mt-3 mb-6 text-sm !text-yellow-600 hover:!text-yellow-700 transition-colors underline-offset-4 hover:!underline"
            >
              Bạn chưa có tài khoản Duck Shop? Đăng ký
            </NavLink>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Login;

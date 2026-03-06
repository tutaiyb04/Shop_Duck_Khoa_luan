import FacebookLogin from "@greatsumini/react-facebook-login";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useGoogleLogin } from "@react-oauth/google";
import { Controller } from "react-hook-form";
import { NavLink } from "react-router-dom";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import useRegister from "@/hooks/useRegister";
import useLoginGoogle from "@/hooks/useLoginGoogle";
import useLoginFacebook from "@/hooks/useLoginFacebook";
import useLoginPhone from "@/hooks/useLoginPhone";
import logoImage from "@/assets/logo3.png";

function Register() {
  const [isPhoneMode, setIsPhoneMode] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const { form, error, isLoading, onSubmit } = useRegister();

  const { onSuccess: onGoogleSuccess } = useLoginGoogle();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: onGoogleSuccess,
    onError: () => console.log("Đăng nhập Google thất bại"),
  });

  const { onSuccess: onFacebookSuccess } = useLoginFacebook();
  const { isOtpSent, otpCode, setOtpCode, handleSendOtp, handleVerifyOtp } =
    useLoginPhone();

  return (
    <div className="w-full min-h-screen bg-amber-50 flex items-center justify-center py-10 lg:py-0">
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8 px-4">
        {/* Nếu muốn ko có ảnh ở giao diện màn nhỏ thì thêm hidden lg:flex */}
        <div className="flex flex-col items-center justify-center h-[100vh] lg:h-auto pb-20 lg:pb-0">
          <img
            src={logoImage}
            alt="Welcome to Duck Shop"
            className="w-full max-w-sm lg:max-w-lg object-contain"
          />
          <div className="absolute bottom-10 animate-bounce lg:hidden text-yellow-600 flex flex-col items-center">
            <span className="text-sm font-medium mb-1">
              Vuốt xuống để đăng ký
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

        <div className="flex flex-col justify-center items-center w-full min-h-[100vh] lg:min-h-0 py-10 lg:py-0">
          <Card className="w-full max-w-md shadow-lg border !border-gray-200 bg-white">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold text-gray-800">
                Đăng ký
              </CardTitle>
              <CardDescription className="text-gray-500">
                Bạn chưa có tài khoản? Hãy đăng ký ngay
              </CardDescription>
            </CardHeader>

            {isPhoneMode ? (
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {!isOtpSent ? (
                    <>
                      <FieldLabel>Nhập số điện thoại của bạn</FieldLabel>
                      <PhoneInput
                        placeholder="Nhập số điện thoại"
                        value={phoneNumber} // <-- Sửa lại thành phoneNumber (không phải otpCode)
                        onChange={setPhoneNumber}
                        defaultCountry="VN"
                        international={true}
                        withCountryCallingCode={true}
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-within:ring-0 focus-within:border-yellow-500"
                      />
                      <Button
                        type="button"
                        className="w-full !bg-yellow-500 text-white hover:!bg-yellow-600 transition-colors h-10 !border-0 !ring-0 !outline-none"
                        // onClick: Truyền phoneNumber vào hàm handleSendOtp
                        onClick={() => handleSendOtp(phoneNumber)}
                      >
                        Gửi mã OTP
                      </Button>
                    </>
                  ) : (
                    <>
                      <FieldLabel>Nhập mã xác nhận (6 số)</FieldLabel>
                      <Input
                        placeholder="Nhập mã OTP..."
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)} // Cập nhật state OTP
                        className="!ring-0 focus-visible:border-yellow-500"
                      />
                      <Button
                        type="button"
                        className="w-full !bg-yellow-500 text-white hover:!bg-yellow-600 transition-colors h-10 !border-0 !ring-0 !outline-none"
                        onClick={() => handleVerifyOtp()} // Bấm nút thì gọi hàm xác nhận
                      >
                        Xác nhận mã OTP
                      </Button>
                    </>
                  )}

                  <Button
                    type="button"
                    className="w-full !bg-white text-gray-500 hover:!bg-blue-50 transition-colors h-10 border !border-gray-300 !ring-0 !outline-none font-medium"
                    onClick={() => {
                      setIsPhoneMode(false);
                    }}
                  >
                    Đăng ký với tài khoản DuckShop
                  </Button>

                  <div id="recaptcha-container"></div>
                </div>
              </CardContent>
            ) : (
              <CardContent>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <Controller
                    name="username"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Nhập tên đăng nhập</FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                          placeholder="username"
                          className="!ring-0 focus-visible:border-yellow-500"
                        />
                        {fieldState.invalid && (
                          <div className="text-sm font-medium text-red-500 mt-1">
                            {fieldState.error?.message}
                          </div>
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Nhập email</FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          type="email"
                          aria-invalid={fieldState.invalid}
                          placeholder="name@gmail.com"
                          className="!ring-0 focus-visible:border-yellow-500"
                        />
                        {fieldState.invalid && (
                          <div className="text-sm font-medium text-red-500 mt-1">
                            {fieldState.error?.message}
                          </div>
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Nhập mật khẩu</FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          type="password"
                          aria-invalid={fieldState.invalid}
                          placeholder="••••••••"
                          className="!ring-0 focus-visible:border-yellow-500"
                        />
                        {fieldState.invalid && (
                          <div className="text-sm font-medium text-red-500 mt-1">
                            {fieldState.error?.message}
                          </div>
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="confirmPassword"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Xác nhận mật khẩu</FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          type="password"
                          aria-invalid={fieldState.invalid}
                          placeholder="••••••••"
                          className="!ring-0 focus-visible:border-yellow-500"
                        />
                        {fieldState.invalid && (
                          <div className="text-sm font-medium text-red-500 mt-1">
                            {fieldState.error?.message}
                          </div>
                        )}
                      </Field>
                    )}
                  />
                  {error && (
                    <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 rounded">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full !bg-yellow-500 text-white hover:!bg-yellow-600 transition-colors h-10 !border-0 !ring-0 !outline-none"
                    disabled={isLoading}
                  >
                    {isLoading ? "Đang xử lý" : "Đăng ký"}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-gray-50 px-2 text-gray-500 font-medium">
                        Hoặc
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      type="button"
                      onClick={() => handleGoogleLogin()}
                      className="w-full flex items-center justify-center gap-2 !bg-white text-gray-500 hover:!bg-blue-50 transition-colors h-10 border !border-gray-300 !ring-0 !outline-none"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Đăng ký bằng Google
                    </Button>

                    <FacebookLogin
                      appId={import.meta.env.VITE_FACEBOOK_APP_ID}
                      fields="name, email, picture"
                      onSuccess={onFacebookSuccess}
                      onFail={(error) => {
                        console.log("Lỗi: ", error);
                      }}
                      render={({ onClick }) => (
                        <Button
                          type="button"
                          onClick={onClick}
                          className="w-full !bg-white text-gray-500 hover:!bg-blue-50 transition-colors h-10 border !border-gray-300 !ring-0 !outline-none"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                          </svg>
                          Đăng ký bằng Facebook
                        </Button>
                      )}
                    />
                  </div>

                  <Button
                    type="button"
                    className="w-full !bg-white text-gray-500 hover:!bg-blue-50 transition-colors h-10 border !border-gray-300 !ring-0 !outline-none"
                    onClick={() => {
                      setIsPhoneMode(true);
                    }}
                  >
                    Đăng nhập với số điện thoại
                  </Button>
                </form>
              </CardContent>
            )}

            <NavLink
              to="/login"
              className="flex justify-center mt-3 text-sm !text-yellow-600 hover:!text-yellow-700 transition-colors underline-offset-4 hover:!underline"
            >
              Bạn đã có tài khoản? Đăng nhập
            </NavLink>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Register;

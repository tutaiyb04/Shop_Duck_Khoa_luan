import FacebookLogin from "@greatsumini/react-facebook-login";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { GoogleLogin } from "@react-oauth/google";
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
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-within:ring-0 focus-within:border-yellow-500 shadow-none"
                      />
                      <Button
                        type="button"
                        className="w-full !bg-yellow-500 text-white hover:!bg-yellow-600 transition-colors h-10 !border-0 !ring-0 !outline-none focus:!ring-0 focus:!outline-none focus-visible:!ring-0 focus-visible:!outline-none"
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
                        className="focus-visible:ring-0 focus-visible:border-yellow-500 focus-visible:ring-offset-0 shadow-none"
                      />
                      <Button
                        type="button"
                        className="w-full !bg-yellow-500 text-white hover:!bg-yellow-600 transition-colors h-10 !border-0 !ring-0 !outline-none focus:!ring-0 focus:!outline-none focus-visible:!ring-0 focus-visible:!outline-none"
                        onClick={() => handleVerifyOtp()} // Bấm nút thì gọi hàm xác nhận
                      >
                        Xác nhận mã OTP
                      </Button>
                    </>
                  )}

                  <Button
                    type="button"
                    className="w-full !bg-white text-gray-500 hover:!bg-blue-50 transition-colors h-10 border !border-gray-300 !ring-0 !outline-none focus:!ring-0 focus:!outline-none focus-visible:!ring-0 focus-visible:!outline-none font-medium"
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
                          className="focus-visible:ring-0 focus-visible:border-yellow-500 focus-visible:ring-offset-0 shadow-none"
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
                          className="focus-visible:ring-0 focus-visible:border-yellow-500 focus-visible:ring-offset-0 shadow-none"
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
                          className="focus-visible:ring-0 focus-visible:border-yellow-500 focus-visible:ring-offset-0 shadow-none"
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
                          className="focus-visible:ring-0 focus-visible:border-yellow-500 focus-visible:ring-offset-0 shadow-none"
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
                    className="w-full !bg-yellow-500 text-white hover:!bg-yellow-600 transition-colors h-10 !border-0 !ring-0 !outline-none focus:!ring-0 focus:!outline-none focus-visible:!ring-0 focus-visible:!outline-none"
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
                    <div className="w-full flex justify-center [&>div]:w-full hover:opacity-90 transition-opacity">
                      <GoogleLogin
                        text="signup_with"
                        locale="vi"
                        onSuccess={onGoogleSuccess}
                      />
                    </div>

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
                          className="w-full !bg-white text-gray-500 hover:!bg-blue-50 transition-colors h-10 border !border-gray-300 !ring-0 !outline-none focus:!ring-0 focus:!outline-none focus-visible:!ring-0 focus-visible:!outline-none"
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
                    className="w-full !bg-white text-gray-500 hover:!bg-blue-50 transition-colors h-10 border !border-gray-300 !ring-0 !outline-none focus:!ring-0 focus:!outline-none focus-visible:!ring-0 focus-visible:!outline-none"
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

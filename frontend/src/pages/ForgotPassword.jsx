import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useForgotPassword from "@/hooks/useForgotPassword";
import { NavLink } from "react-router-dom";
import logoImage from "@/assets/logo3.png";

function ForgotPassword() {
  const { form, isLoading, error, isSuccess, onSubmit } = useForgotPassword();

  return (
    <div className="w-full min-h-screen bg-amber-50 flex items-center justify-center py-10">
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 items-center">
        {/* Nếu muốn ko có ảnh ở giao diện màn nhỏ thì thêm hidden lg:flex */}
        <div className="hidden lg:flex flex-col items-center justify-center p-8">
          <img
            src={logoImage}
            alt="Welcome to Duck Shop"
            className="w-full max-x-lg object-contain"
          />
        </div>
        <div className="flex justify-center w-full">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className={"space-y-1 text-center"}>
              <CardTitle>Gửi yêu cầu đặt lại mật khẩu</CardTitle>
            </CardHeader>

            <CardContent>
              {isSuccess ? (
                <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded text-center">
                  Liên kết khôi phục đã được gửi. Vui lòng kiểm tra hộp thư đến
                  (hoặc thư rác) của bạn.
                </div>
              ) : (
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                  noValidate
                >
                  <Controller
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>
                          Nhập email để nhận yêu cầu đặt lại mật khẩu
                        </FieldLabel>
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
                    {isLoading ? "Đang xử lý" : "Gửi yêu cầu"}
                  </Button>
                </form>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <NavLink
                to="/login"
                className="flex justify-end mt-3 text-sm !text-yellow-600 hover:!text-yellow-700 underline-offset-4 hover:!underline"
              >
                Quay lại trang Đăng nhập
              </NavLink>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

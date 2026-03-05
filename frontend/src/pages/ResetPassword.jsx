import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Controller } from "react-hook-form";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useResetPassword from "@/hooks/useResetPassword";

function ResetPassword() {
  const { form, isLoading, isSuccess, onSubmit, error } = useResetPassword();

  return (
    <div className="flex items-center justify-center min-h-screen bg-amber-50 w-screen">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className={"space-y-1 text-center"}>
          <CardTitle>Đặt lại mật khẩu</CardTitle>
        </CardHeader>

        <CardContent>
          {isSuccess ? (
            <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded text-center">
              Mật khẩu đã được đặt lại. Vui lòng đăng nhập
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Nhập mật khẩu thay đổi</FieldLabel>
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
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Xác nhận mật khẩu thay đổi</FieldLabel>
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
                {isLoading ? "Đang xử lý" : "Đặt lại mật khẩu"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ResetPassword;

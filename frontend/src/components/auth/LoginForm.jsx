import { Controller } from "react-hook-form";
import { NavLink } from "react-router-dom";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function LoginForm({ form, onSubmit, isLoading, error }) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        control={form.control}
        name="identifier"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>
              Nhập Email hoặc Tên đăng nhập
            </FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="name hoặc name@gmail.com"
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
            <FieldLabel htmlFor={field.name}>Nhập mật khẩu</FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="password"
              aria-invalid={fieldState.invalid}
              placeholder="••••••••"
              className="!ring-0 focus-visible:border-yellow-500 "
            />
            {fieldState.invalid && (
              <div className="text-sm font-medium text-red-500 mt-1">
                {fieldState.error?.message}
              </div>
            )}
          </Field>
        )}
      />

      <NavLink
        to="/reset-password"
        className="flex justify-end mt-3 text-sm !text-yellow-600 hover:!text-yellow-700 underline-offset-4 hover:!underline"
      >
        Quên mật khẩu?
      </NavLink>

      {error && (
        <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 border border-red-200 rounded">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full !bg-yellow-500 text-white hover:!bg-yellow-600 transition-colors h-10 !border-0 !ring-0 !outline-none"
        disabled={isLoading}
      >
        {isLoading ? "Đang xử lý..." : "Đăng nhập"}
      </Button>
    </form>
  );
}

export default LoginForm;

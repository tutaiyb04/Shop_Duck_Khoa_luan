import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";

function RegisterForm({ form, onSubmit, isLoading, error }) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
    </form>
  );
}

export default RegisterForm;

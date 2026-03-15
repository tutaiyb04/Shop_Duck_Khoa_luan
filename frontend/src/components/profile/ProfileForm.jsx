import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import AvatarUpload from "@/components/profile/AvatarUpload";

function ProfileForm({
  form,
  user,
  previewImage,
  handleImageSelect,
  onSubmit,
  isLoading,
}) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Khu vực chọn avatar */}
      <AvatarUpload
        className="flex flex-col items-center space-y-4 mb-6"
        user={user}
        previewImage={previewImage}
        onFileSelect={handleImageSelect}
      />
      <Controller
        name="username"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>
              Tên hiển thị (Bắt buộc)
            </FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="phone"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Số điện thoại</FieldLabel>
            <Input {...field} id={field.name} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="address"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Địa chỉ nhận hàng</FieldLabel>
            <Input {...field} id={field.name} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="description"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Giới thiệu</FieldLabel>
            <Input {...field} id={field.name} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Button
        type="submit"
        className="w-full !bg-yellow-500 text-white hover:!bg-yellow-600 transition-colors h-10 !border-0 !ring-0 !outline-none"
        disabled={isLoading}
      >
        {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
      </Button>
    </form>
  );
}

export default ProfileForm;

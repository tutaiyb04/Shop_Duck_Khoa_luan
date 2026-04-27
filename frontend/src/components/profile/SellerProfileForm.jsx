import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import AvatarUpload from "@/components/profile/AvatarUpload";

function SellerProfileForm({
  form,
  user,
  previewImage,
  handleImageSelect,
  onSubmit,
  isLoading,
}) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <AvatarUpload
        className="flex flex-col items-center space-y-4 mb-6"
        user={user}
        previewImage={previewImage}
        onFileSelect={handleImageSelect}
      />

      <Controller
        name="storeName"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Tên gian hàng</FieldLabel>
            <Input
              {...field}
              id={field.name}
              placeholder="Ví dụ: Shop Duck"
              aria-invalid={fieldState.invalid}
              className="!ring-0 focus-visible:border-yellow-500"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="description"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>
              Giới thiệu gian hàng
            </FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              rows={5}
              placeholder="Mô tả ngắn về hàng hóa, cách giao hàng, giờ làm việc…"
              className="!ring-0 focus-visible:border-yellow-500 min-h-[120px]"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <p className="text-xs text-muted-foreground">
        Ảnh đại diện và phần giới thiệu cũng hiển thị trên trang sản phẩm cho
        khách hàng. Trùng với mục &quot;Giới thiệu&quot; tại Hồ sơ cá nhân.
      </p>

      <Button
        type="submit"
        className="w-full !bg-yellow-500 text-white hover:!bg-yellow-600 !transition-colors h-10 !border-0 !ring-0 !outline-none"
        disabled={isLoading}
      >
        {isLoading ? "Đang lưu..." : "Lưu thông tin gian hàng"}
      </Button>
    </form>
  );
}

export default SellerProfileForm;

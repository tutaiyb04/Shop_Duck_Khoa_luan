import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

import AvatarUpload from "@/components/shared/AvatarUpload";
import useProfile from "@/hooks/useProfile";

function Profile() {
  const {
    user,
    form,
    isLoading,
    isLoadingData,
    previewImage,
    handleImageSelect,
    onSubmit,
  } = useProfile();

  if (isLoadingData)
    return (
      <div className="text-center mt-20 text-gray-500">
        Đang tải dữ liệu hồ sơ...
      </div>
    );

  return (
    <div className="container mx-auto p-6 max-w-2xl mt-10">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Thông tin cá nhân</CardTitle>
          <CardDescription>
            Quản lý hồ sơ, địa chỉ giao hàng và thông tin liên hệ.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Khu vực chọn avatar */}
            <AvatarUpload
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="address"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Địa chỉ nhận hàng
                  </FieldLabel>
                  <Input {...field} id={field.name} />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
        </CardContent>
      </Card>
    </div>
  );
}

export default Profile;

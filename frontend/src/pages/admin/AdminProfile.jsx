import useProfile from "@/hooks/userHooks/useProfile";
import LoadingBlock from "@/components/shared/LoadingBlock";
import ProfileForm from "@/components/profile/ProfileForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function AdminProfile() {
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
      <LoadingBlock
        message="Đang tải dữ liệu hồ sơ Quản trị viên…"
        className="mt-20 py-12"
      />
    );

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-sm border border-gray-200 bg-white rounded-xl overflow-hidden">
        <CardHeader className="border-b border-gray-100 mb-4 sm:mb-6 bg-gray-50/50 p-5 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">
            Hồ sơ Quản trị viên
          </CardTitle>
          <CardDescription className="text-sm text-gray-500 mt-1">
            Quản lý thông tin cá nhân, ảnh đại diện và bảo mật của tài khoản
            Admin.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-4 sm:px-8 pb-6 sm:pb-8">
          <ProfileForm
            form={form}
            user={user}
            previewImage={previewImage}
            handleImageSelect={handleImageSelect}
            onSubmit={onSubmit}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminProfile;

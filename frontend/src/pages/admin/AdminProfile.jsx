import useProfile from "@/hooks/userHooks/useProfile";
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
      <div className="text-center mt-20 text-gray-500">
        Đang tải dữ liệu hồ sơ Quản trị viên...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-sm border border-gray-100 bg-white rounded-xl">
        <CardHeader className="border-b border-gray-50 mb-6 bg-gray-50/50 rounded-t-xl">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Hồ sơ Quản trị viên
          </CardTitle>
          <CardDescription className="text-gray-500">
            Quản lý thông tin cá nhân, ảnh đại diện và bảo mật của tài khoản
            Admin.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8">
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

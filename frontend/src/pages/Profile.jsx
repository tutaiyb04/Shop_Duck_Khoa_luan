import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useProfile from "@/hooks/userHooks/useProfile";
import UserSidebar from "@/components/shared/UserSidebar";
import LoadingBlock from "@/components/shared/LoadingBlock";
import ProfileForm from "@/components/profile/ProfileForm";

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
      <LoadingBlock
        message="Đang tải dữ liệu hồ sơ…"
        className="mt-20 py-12"
      />
    );

  return (
    <div className="container mx-auto px-4 py-20 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Sidebar */}
        <UserSidebar />

        <div className="flex-1 w-full">
          <Card className="shadow-sm border-1 bg-white">
            <CardHeader className="border-b mb-6">
              <CardTitle className="text-2xl font-bold">
                Hồ sơ cá nhân
              </CardTitle>
              <CardDescription>
                Quản lý hồ sơ, địa chỉ giao hàng và thông tin liên hệ.
              </CardDescription>
            </CardHeader>

            <CardContent>
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
      </div>
    </div>
  );
}

export default Profile;

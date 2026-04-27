import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useSellerProfile from "@/hooks/userHooks/useSellerProfile";
import UserSidebar from "@/components/shared/UserSidebar";
import LoadingBlock from "@/components/shared/LoadingBlock";
import SellerProfileForm from "@/components/profile/SellerProfileForm";
import { Star, Package, CheckCircle2, MessageCircle } from "lucide-react";

function SellerProfile() {
  const {
    user,
    form,
    isLoading,
    isLoadingData,
    previewImage,
    handleImageSelect,
    onSubmit,
  } = useSellerProfile();

  if (isLoadingData)
    return (
      <LoadingBlock
        message="Đang tải thông tin gian hàng…"
        className="mt-20 py-12"
      />
    );

  const sp = user?.sellerProfile;
  const stats = user?.sellerStats;
  const reviewCount = sp?.totalReviews ?? 0;

  return (
    <div className="container mx-auto px-4 py-20 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <UserSidebar />

        <div className="flex-1 w-full space-y-6">
          <Card className="shadow-sm border-1 bg-white">
            <CardHeader className="border-b mb-2">
              <div className="flex items-start gap-3">
                <div>
                  <CardTitle className="mb-2 text-2xl font-bold">
                    Thông tin người bán
                  </CardTitle>
                  <CardDescription>
                    Gắn với tài khoản của bạn trên Duck Shop: tên gian hàng,
                    giới thiệu và ảnh đại diện khi khách xem sản phẩm.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div className="flex items-center gap-3 rounded-lg border border-slate-200/80 bg-slate-50/50 px-3 py-2.5">
                  <Package className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Tin đăng</p>
                    <p className="text-sm font-semibold tabular-nums text-slate-900">
                      {stats?.totalProducts?.toLocaleString("vi-VN") ?? "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-slate-200/80 bg-slate-50/50 px-3 py-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Đã bán</p>
                    <p className="text-sm font-semibold tabular-nums text-slate-900">
                      {stats?.totalSold?.toLocaleString("vi-VN") ?? "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-slate-200/80 bg-slate-50/50 px-3 py-2.5 sm:col-span-2 xl:col-span-1">
                  <Star className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Đánh giá</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {reviewCount > 0 && user?.rating != null
                        ? `${Number(user.rating).toFixed(1)} `
                        : "Chưa có đánh giá "}
                      <span className="font-normal text-muted-foreground">
                        (
                        {reviewCount.toLocaleString("vi-VN")} lượt)
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-slate-200/80 bg-slate-50/50 px-3 py-2.5">
                  <MessageCircle className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phản hồi</p>
                    <p className="text-sm font-semibold tabular-nums text-slate-900">
                      {sp?.responseRate != null
                        ? `${sp.responseRate}%`
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-slate-200/80 bg-slate-50/50 px-3 py-2.5">
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      Gian hàng
                    </span>
                    {sp?.isVerified || user?.isEmailVerified || user?.authType === "google" || user?.role === "admin" ? (
                      <Badge className="bg-emerald-600 hover:bg-emerald-600">
                        Đã xác minh
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Chưa xác minh gian hàng</Badge>
                    )}
                  </div>
                </div>
              </div>

              <SellerProfileForm
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

export default SellerProfile;

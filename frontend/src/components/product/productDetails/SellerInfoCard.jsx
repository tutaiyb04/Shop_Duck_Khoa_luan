import {
  Check,
  ShieldCheck,
  MessageCircle,
  Truck,
  BadgeCheck,
  Mail,
  Smartphone,
  Star,
  Store,
  ShieldAlert,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/shared/UserAvatar";

function SellerInfoCard({ seller }) {
  const storeName = (seller?.sellerProfile?.storeName || "").trim();
  const displayName = storeName || seller?.username || "TÊN NGƯỜI BÁN";

  const rating = Number(
    seller?.rating ?? seller?.sellerProfile?.rating ?? 0,
  );
  const totalReviews = seller?.sellerProfile?.totalReviews || 0;
  const totalProducts = seller?.totalProducts || 0;
  const totalSold = seller?.totalSold || 0;
  const responseRate = seller?.sellerProfile?.responseRate || 0;

  const isReliable = rating >= 4.5 && totalReviews >= 10; // Đáng tin cậy: >= 4.5 sao và >= 10 đánh giá
  const isReputable = seller?.isEmailVerified || seller?.authType === "google"; // Uy tín: Đã xác minh tài khoản
  const isFastResponse = responseRate >= 90; // Phản hồi nhanh: Tỷ lệ >= 90%
  const isFastDelivery = rating >= 4.0;

  return (
    <Card className="border shadow-sm bg-white overflow-hidden rounded-xl p-0">
      <CardContent className="px-10 py-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Thông tin người bán
        </h2>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <UserAvatar
                  user={seller}
                  className="w-24 h-24 shadow-sm text-2xl"
                />
                {seller?.isEmailVerified ||
                seller?.authType === "google" ||
                seller?.role === "admin" ? (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-600 text-white text-sm font-medium px-2 py-1 rounded flex items-center gap-1 whitespace-nowrap z-10 border border-white">
                    <BadgeCheck className="w-4 h-4" /> Đã xác minh
                  </div>
                ) : (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-400 text-white text-sm font-medium px-2 py-1 rounded flex items-center gap-1 whitespace-nowrap z-10 border border-white">
                    <ShieldAlert className="w-4 h-4" /> Chưa xác minh
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col mt-1 ml-5">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-gray-800 leading-none">
                  {displayName}
                </h3>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <div className="relative">
                    <Mail className="w-4 h-4" />
                    <div className="absolute -top-1 -right-1.5 bg-white rounded-full">
                      <Check className="w-3 h-3 text-yellow-600" />
                    </div>
                  </div>
                  <div className="relative">
                    <Smartphone className="w-4 h-4" />
                    <div className="absolute -top-1 -right-1.5 bg-white rounded-full">
                      <Check className="w-3 h-3 text-yellow-600" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-2 text-sm text-gray-600 mb-3">
                <div className="flex items-center text-yellow-400">
                  <Star className="w-4 h-4 fill-current mr-1" />
                  <span className="font-medium text-gray-700">
                    {totalReviews > 0 && rating > 0
                      ? rating.toFixed(1)
                      : "Chưa có"}
                  </span>
                </div>
                <NavLink to="#" className="text-blue-500 hover:!underline">
                  ({totalReviews} đánh giá)
                </NavLink>
                <span className="text-gray-300">•</span>
                <span>{totalProducts} sản phẩm</span>
                <span className="text-gray-300">•</span>
                <span>{totalSold} đã bán</span>
              </div>

              <div>
                <Button
                  variant="secondary"
                  className="w-35 h-8 text-xs !bg-gray-200 hover:!bg-gray-300 !border-gray-200 text-black px-3 flex items-center gap-2 cursor-pointer !transition-all !border-1 !ring-0 !outline-none"
                >
                  <Store className="w-4 h-4" /> Xem shop
                </Button>
              </div>
            </div>
          </div>

          <div className="hidden md:block w-px h-30 bg-gray-200 mx-2 shrink-0"></div>

          <div className="flex items-start justify-between md:justify-end gap-2 md:gap-8 flex-1">
            {isReliable && (
              <div className="flex flex-col items-center gap-2 w-20 shrink-0">
                <div className="w-15 h-15 rounded-full bg-amber-50 text-yellow-500 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-xs text-gray-500 font-bold text-center leading-tight">
                  Đáng tin cậy
                </span>
              </div>
            )}

            {isReputable && (
              <div className="flex flex-col items-center gap-2 w-20 shrink-0">
                <div className="w-15 h-15 rounded-full bg-amber-50 text-yellow-500 flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <span className="text-xs text-gray-500 font-bold text-center leading-tight">
                  Uy tín
                </span>
              </div>
            )}

            {isFastResponse && (
              <div className="flex flex-col items-center gap-2 w-20 shrink-0">
                <div className="w-15 h-15 rounded-full bg-amber-50 text-yellow-500 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-xs text-gray-500 font-bold text-center leading-tight">
                  Phản hồi nhanh
                </span>
              </div>
            )}

            {isFastDelivery && (
              <div className="flex flex-col items-center gap-2 w-20 shrink-0">
                <div className="w-15 h-15 rounded-full bg-amber-50 text-yellow-500 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-xs text-gray-500 font-bold text-center leading-tight">
                  Giao hàng nhanh
                </span>
              </div>
            )}

            {!isReliable &&
              !isReputable &&
              !isFastResponse &&
              !isFastDelivery && (
                <div className="text-xs text-gray-400 italic flex items-center justify-center h-full">
                  Shop mới / Chưa có huy hiệu
                </div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SellerInfoCard;

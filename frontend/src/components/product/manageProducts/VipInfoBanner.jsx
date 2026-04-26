import { Sparkles } from "lucide-react";

function VipInfoBanner() {
  return (
    <div className="mb-4 rounded-lg border border-amber-200/80 bg-amber-50/80 p-3 text-sm text-amber-950">
      <p className="font-semibold flex items-center gap-1.5">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
        Gói hiển thị VIP
      </p>
      <p className="mt-1 text-xs sm:text-sm text-amber-900/90 leading-relaxed">
        Chọn <strong>Nâng cấp VIP</strong> ở bảng dưới: gói 7 hoặc 30 ngày, quét
        mã / thanh toán PayOS. Tin VIP nổi bật trên trang chủ và ưu tiên tại
        bảng quản trị.
      </p>
    </div>
  );
}

export default VipInfoBanner;

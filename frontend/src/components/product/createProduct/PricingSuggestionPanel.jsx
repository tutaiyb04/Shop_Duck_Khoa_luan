import React from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatVnd,
  pricingConfidenceVi,
  pricingMethodVi,
} from "@/utils/pricingSuggestionLabels";

export default function PricingSuggestionPanel({
  form,
  phase,
  suggestion,
  errorMessage,
  ready,
}) {
  // trạng thái gợi ý giá
  const dormant = !ready;

  // áp dụng gợi ý giá vào ô giá bán
  const applySuggestedPrice = () => {
    const v = suggestion?.suggestedPriceVnd;

    if (v == null || Number.isNaN(Number(v))) return;
    
    dform.setValue("price", String(Number(v)), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <div
      className={[
        "rounded-lg border p-4 transition-all duration-200",
        dormant
          ? "border-dashed border-gray-200 bg-gray-50/70 opacity-55 pointer-events-none select-none"
          : phase === "loading"
            ? "border-yellow-200 bg-amber-50/40"
            : phase === "error"
              ? "border-red-200 bg-red-50/30"
              : "border-yellow-300/80 bg-gradient-to-br from-amber-50/90 to-white",
      ].join(" ")}
      aria-live="polite"
    >
      <div className="flex items-start gap-2">
        <Sparkles
          className={`mt-0.5 h-4 w-4 shrink-0 ${dormant ? "text-gray-300" : "text-yellow-600"}`}
          aria-hidden
        />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className={`text-sm font-semibold ${dormant ? "text-gray-400" : "text-gray-900"}`}
            >
              Gợi ý giá thông minh
            </span>
            {!dormant && phase === "loading" && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-800">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Đang phân tích dữ liệu…
              </span>
            )}
          </div>

          {dormant && (
            <p className="text-xs text-gray-400 leading-relaxed">
              Chọn đủ{" "}
              <span className="font-medium text-gray-500">danh mục phụ</span> và{" "}
              <span className="font-medium text-gray-500">tình trạng</span> —
              gợi ý giá sẽ hiển thị tự động (không cần bấm thêm nút).
            </p>
          )}

          {!dormant && phase === "loading" && (
            <div className="mt-2 h-16 animate-pulse rounded-md bg-amber-100/40" />
          )}

          {!dormant && phase === "error" && (
            <p className="text-xs text-red-700">{errorMessage}</p>
          )}

          {!dormant && phase === "success" && suggestion && (
            <div className="space-y-2 text-sm">
              {suggestion.suggestedPriceVnd != null ? (
                <p className="text-gray-900">
                  <span className="text-gray-600">Mức gợi ý: </span>
                  <span className="font-bold text-yellow-700 tabular-nums">
                    {formatVnd(suggestion.suggestedPriceVnd)}
                  </span>
                  {suggestion.priceRangeVnd?.min != null &&
                    suggestion.priceRangeVnd?.max != null && (
                      <span className="block text-xs text-gray-500 mt-1">
                        Khoảng tham khảo:{" "}
                        {formatVnd(suggestion.priceRangeVnd.min)} —{" "}
                        {formatVnd(suggestion.priceRangeVnd.max)}
                      </span>
                    )}
                </p>
              ) : (
                <p className="text-xs text-amber-900">
                  {suggestion.hint ||
                    "Chưa có đủ tin cùng bộ lọc để đề xuất một mức giá cụ thể."}
                </p>
              )}

              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-600">
                <span title="Nguồn & cách tính">
                  {pricingMethodVi(suggestion.method)}
                </span>
                <span className="hidden sm:inline text-gray-300">·</span>
                <span>{pricingConfidenceVi(suggestion.confidence)}</span>
              </div>

              <div className="flex flex-wrap gap-3 text-[11px] text-gray-500">
                <span>
                  Tin đang bán (mẫu):{" "}
                  <strong className="text-gray-700 tabular-nums">
                    {suggestion.basedOn?.activeListings?.count ?? 0}
                  </strong>
                </span>
                <span>
                  Đơn hoàn thành (mẫu):{" "}
                  <strong className="text-gray-700 tabular-nums">
                    {suggestion.basedOn?.completedOrders?.count ?? 0}
                  </strong>
                </span>
              </div>

              {suggestion.suggestedPriceVnd != null && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 !border-yellow-400/70 !bg-white text-xs hover:!bg-yellow-50"
                  onClick={applySuggestedPrice}
                >
                  Điền vào ô giá bán
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

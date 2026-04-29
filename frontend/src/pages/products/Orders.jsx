import UserSidebar from "@/components/shared/UserSidebar";
import ReviewModal from "@/components/order/ReviewModal";
import PurchaseHistoryTable from "@/components/order/PurchaseHistoryTable";
import { usePurchaseHistory } from "@/hooks/orderHooks/usePurchaseHistory";
import { useReviewModal } from "@/hooks/reviewHooks/useReviewModal";
import LoadingBlock from "@/components/shared/LoadingBlock";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function Orders() {
  const {
    orders,
    total,
    currentPage,
    totalPages,
    isLoading,
    goToPage,
    refetch,
  } = usePurchaseHistory();

  const {
    isReviewModalOpen,
    rating,
    setRating,
    comment,
    setComment,
    isReviewLoading,
    openReviewModal,
    closeReviewModal,
    submitReview,
  } = useReviewModal();

  const handleSubmitReview = async () => {
    const ok = await submitReview();
    if (ok) refetch();
  };

  if (isLoading) {
    return (
      <LoadingBlock
        message="Đang tải lịch sử mua hàng…"
        className="mt-20 py-12"
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-6">
        <UserSidebar />

        <div className="flex-1 w-full">
          <Card className="bg-white">
            <CardHeader className="border-b border-border pb-6">
              <CardTitle className="text-2xl font-bold text-gray-800">
                Lịch sử mua hàng
              </CardTitle>
              <CardDescription className="text-gray-600">
                Các giao dịch đã hoàn tất khi người bán xác nhận bán cho bạn
                (qua chat trên Duck Shop). Bạn có thể để lại đánh giá sau khi
                mua.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="rounded-xl border border-amber-100 bg-amber-50/80 px-5 py-4 shadow-sm">
                <p className="text-sm font-medium text-amber-900/90">
                  Tổng số giao dịch mua hàng đã hoàn tất
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-amber-950">
                  {total.toLocaleString("vi-VN")}
                </p>
                <p className="mt-2 text-xs text-amber-900/70">
                  Ghi nhận sau khi người bán xác nhận &quot;Đã bán&quot; cho bạn
                </p>
              </div>

              <PurchaseHistoryTable
                orders={orders}
                onOpenReview={openReviewModal}
              />

              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 border-t border-border pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    Trước
                  </Button>
                  <span className="px-2 text-sm text-gray-600">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={closeReviewModal}
        rating={rating}
        setRating={setRating}
        comment={comment}
        setComment={setComment}
        onSubmit={handleSubmitReview}
        loading={isReviewLoading}
      />
    </div>
  );
}

export default Orders;

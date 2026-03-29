import UserSidebar from "@/components/shared/UserSidebar";
import ReviewModal from "@/components/order/ReviewModal";
import OrderTab from "@/components/order/OrderTab";
import { useOrder } from "@/hooks/orderHooks/useOrder";
import OrderTable from "@/components/order/OrderTable";

const Orders = () => {
  const {
    activeTab,
    setActiveTab,
    tabs,
    filteredOrders,
    isReviewModalOpen,
    rating,
    setRating,
    comment,
    setComment,
    isReviewLoading,
    openReviewModal,
    closeReviewModal,
    submitReview,
  } = useOrder();

  return (
    <div className="container mx-auto px-4 py-20 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-6">
        {/* CỘT TRÁI: GỌI SIDEBAR */}
        <UserSidebar />

        {/* CỘT PHẢI: NỘI DUNG ĐƠN HÀNG */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            Đơn hàng của tôi
          </h1>

          {/* Thanh Tabs */}
          <OrderTab
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Bảng đơn hàng */}
          <OrderTable orders={filteredOrders} onOpenReview={openReviewModal} />
        </div>
      </div>

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={closeReviewModal}
        rating={rating}
        setRating={setRating}
        comment={comment}
        setComment={setComment}
        onSubmit={submitReview}
        loading={isReviewLoading}
      />
    </div>
  );
};

export default Orders;

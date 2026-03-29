function OrderTable({ orders, onOpenReview }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-3 px-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
              Mã đơn
            </th>
            <th className="py-3 px-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
              Sản phẩm
            </th>
            <th className="py-3 px-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
              Tổng tiền
            </th>
            <th className="py-3 px-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
              Trạng thái
            </th>
            <th className="py-3 px-5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-5 px-5 border-b border-gray-200 text-sm font-medium text-gray-900">
                  {order.id}
                </td>
                <td className="py-5 px-5 border-b border-gray-200 text-sm text-gray-700">
                  {order.productName}
                </td>
                <td className="py-5 px-5 border-b border-gray-200 text-sm text-red-600 font-semibold">
                  {order.price}
                </td>
                <td className="py-5 px-5 border-b border-gray-200 text-sm">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === "Đã giao"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Đang giao"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "Chờ xác nhận"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="py-5 px-5 border-b border-gray-200 text-center text-sm">
                  {order.status === "Đã giao" ? (
                    <button
                      onClick={() =>
                        onOpenReview(order.sellerId, order.productId)
                      }
                      className="text-amber-600 hover:text-amber-700 font-medium underline underline-offset-2"
                    >
                      Đánh giá
                    </button>
                  ) : (
                    <span className="text-gray-400 italic">Không khả dụng</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="5"
                className="py-12 text-center text-gray-500 border-b border-gray-200"
              >
                <div className="flex flex-col items-center justify-center">
                  <span className="text-5xl mb-3">🦆</span>
                  <p className="text-lg">
                    Chưa có đơn hàng nào ở trạng thái này.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default OrderTable;

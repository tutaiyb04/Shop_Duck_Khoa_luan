import { Link } from "react-router-dom";
import { formatVnd } from "@/hooks/orderHooks/usePurchaseHistory";

function PurchaseHistoryTable({ orders, onOpenReview }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
              Mã giao dịch
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
              Sản phẩm
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
              Người bán
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
              Giá trị
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
              Ngày
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
              Trạng thái
            </th>
            <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => {
              const pid = order.productId?._id || order.productId;
              const sid = order.sellerId?._id || order.sellerId;
              const sellerName = order.sellerId?.username ?? "—";
              const pName = order.productId?.name ?? "—";
              const code = order._id
                ? String(order._id).slice(-8).toUpperCase()
                : "—";
              return (
                <tr
                  key={String(order._id)}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4 border-b border-gray-200 text-sm font-mono text-gray-800">
                    #{code}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-200 text-sm">
                    {pid ? (
                      <Link
                        to={`/product/${pid}`}
                        className="text-amber-700 hover:underline font-medium"
                      >
                        {pName}
                      </Link>
                    ) : (
                      pName
                    )}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-200 text-sm text-gray-700">
                    {sellerName}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-200 text-sm text-red-600 font-semibold">
                    {formatVnd(order.totalAmount)}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-200 text-sm text-gray-600 whitespace-nowrap">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString("vi-VN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "—"}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-200 text-sm">
                    <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                      {order.status === "COMPLETED" ? "Hoàn tất" : order.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 border-b border-gray-200 text-center text-sm">
                    {order.status === "COMPLETED" && sid && pid ? (
                      <button
                        type="button"
                        onClick={() => onOpenReview(sid, pid)}
                        className="text-amber-600 hover:text-amber-700 font-medium underline underline-offset-2"
                      >
                        Đánh giá
                      </button>
                    ) : (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={7}
                className="py-12 text-center text-gray-500 border-b border-gray-200"
              >
                <div className="flex flex-col items-center justify-center">
                  <span className="text-5xl mb-3">🦆</span>
                  <p className="text-lg">Chưa có giao dịch mua nào được ghi nhận.</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Khi bạn mua hàng qua chat và người bán xác nhận &quot;Đã
                    bán&quot;, lịch sử sẽ xuất hiện ở đây.
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

export default PurchaseHistoryTable;

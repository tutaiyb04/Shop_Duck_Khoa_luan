import { Link } from "react-router-dom";
import { formatVnd } from "@/hooks/orderHooks/usePurchaseHistory";

function SalesHistoryTable({ orders }) {
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
              Người mua
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
              Giá trị (thống kê)
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
              Ngày
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
              Trạng thái
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => {
              const pid = order.productId?._id || order.productId;
              const pName = order.productId?.name ?? "—";
              const buyerName = order.buyerId?.username ?? "—";
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
                    {buyerName}
                  </td>
                  <td className="py-4 px-4 border-b border-gray-200 text-sm text-slate-800 font-semibold">
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
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={6}
                className="py-12 text-center text-gray-500 border-b border-gray-200"
              >
                <div className="flex flex-col items-center justify-center">
                  <span className="text-5xl mb-3">🦆</span>
                  <p className="text-lg">Chưa có giao dịch bán nào được ghi nhận.</p>
                  <p className="text-sm text-gray-500 mt-1 max-w-md">
                    Sau khi bạn bấm &quot;Đã bán&quot; và chọn người mua đã từng
                    chat, giao dịch sẽ hiển thị tại đây.
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

export default SalesHistoryTable;

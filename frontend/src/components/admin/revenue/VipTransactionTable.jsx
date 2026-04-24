function formatVnd(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return `${Number(n).toLocaleString("vi-VN")} ₫`;
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function TxStatusBadge({ status }) {
  const map = {
    PENDING: { label: "Chờ thanh toán", className: "bg-amber-100 text-amber-900" },
    SUCCESS: { label: "Thành công", className: "bg-green-100 text-green-800" },
    CANCELLED: { label: "Đã hủy", className: "bg-gray-200 text-gray-800" },
  };
  const m = map[status] || { label: status, className: "bg-gray-100 text-gray-700" };
  return (
    <span
      className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${m.className}`}
    >
      {m.label}
    </span>
  );
}

export default function VipTransactionTable({ transactions, loading }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100">
      <table className="w-full min-w-[880px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="whitespace-nowrap p-3 text-left font-semibold text-gray-600">
              Mã giao dịch
            </th>
            <th className="whitespace-nowrap p-3 text-left font-semibold text-gray-600">
              Người mua
            </th>
            <th className="whitespace-nowrap p-3 text-left font-semibold text-gray-600">
              Sản phẩm
            </th>
            <th className="whitespace-nowrap p-3 text-left font-semibold text-gray-600">
              Gói VIP
            </th>
            <th className="whitespace-nowrap p-3 text-right font-semibold text-gray-600">
              Số tiền
            </th>
            <th className="whitespace-nowrap p-3 text-center font-semibold text-gray-600">
              Trạng thái
            </th>
            <th className="whitespace-nowrap p-3 text-left font-semibold text-gray-600">
              Thời gian
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-muted-foreground">
                Đang tải…
              </td>
            </tr>
          ) : transactions.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-muted-foreground">
                Không có giao dịch nào.
              </td>
            </tr>
          ) : (
            transactions.map((row) => (
              <tr
                key={row._id}
                className="border-b border-gray-100 last:border-0 hover:bg-amber-50/40"
              >
                <td className="p-3 font-mono text-xs text-gray-800">
                  {row.orderCode}
                </td>
                <td className="p-3 text-gray-800">
                  <div className="font-medium">
                    {row.user?.username || "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {row.user?.email || ""}
                  </div>
                </td>
                <td className="max-w-[200px] p-3 text-gray-800">
                  <span className="line-clamp-2" title={row.product?.name}>
                    {row.product?.name || "—"}
                  </span>
                </td>
                <td className="p-3 whitespace-nowrap text-gray-700">
                  {row.vipPlanDays ? `${row.vipPlanDays} ngày` : "—"}
                </td>
                <td className="p-3 text-right font-medium tabular-nums text-gray-900">
                  {formatVnd(row.amount)}
                </td>
                <td className="p-3 text-center">
                  <TxStatusBadge status={row.status} />
                </td>
                <td className="p-3 whitespace-nowrap text-gray-600">
                  {formatDate(row.createdAt)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export { formatVnd };

import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatVnd } from "@/hooks/orderHooks/usePurchaseHistory";

function SalesHistoryTable({ orders }) {
  if (!orders.length) {
    return (
      <Card className="border-dashed shadow-none">
        <CardContent className="flex flex-col items-center justify-center gap-2 py-14 text-center">
          <p className="text-lg font-medium text-foreground">
            Chưa có giao dịch bán nào được ghi nhận.
          </p>
          <p className="max-w-md text-sm text-muted-foreground">
            Sau khi bạn bấm &quot;Đã bán&quot; và chọn người mua đã từng chat,
            giao dịch sẽ hiển thị tại đây.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Mã giao dịch
          </TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sản phẩm
          </TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Người mua
          </TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Giá trị (thống kê)
          </TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Ngày
          </TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Trạng thái
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const pid = order.productId?._id || order.productId;
          const pName = order.productId?.name ?? "—";
          const buyerName = order.buyerId?.username ?? "—";
          const code = order._id
            ? String(order._id).slice(-8).toUpperCase()
            : "—";
          return (
            <TableRow key={String(order._id)}>
              <TableCell className="text-sm">#{code}</TableCell>
              <TableCell className="max-w-[220px] whitespace-normal">
                {pid ? (
                  <Button
                    asChild
                    variant="link"
                    className="h-auto p-0 font-medium !text-yellow-700 hover:!text-yellow-800"
                  >
                    <Link to={`/product/${pid}`}>{pName}</Link>
                  </Button>
                ) : (
                  <span className="text-sm">{pName}</span>
                )}
              </TableCell>
              <TableCell className="text-gray-700">{buyerName}</TableCell>
              <TableCell className="font-semibold text-black">
                {formatVnd(order.totalAmount)}
              </TableCell>
              <TableCell className="whitespace-nowrap text-gray-700">
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleString("vi-VN", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : "—"}
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className="border-0 !bg-emerald-100 font-semibold text-emerald-800 hover:!bg-emerald-100 dark:!bg-emerald-950 dark:!text-emerald-200"
                >
                  {order.status === "COMPLETED" ? "Hoàn tất" : order.status}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default SalesHistoryTable;

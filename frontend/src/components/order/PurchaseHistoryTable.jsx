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

function PurchaseHistoryTable({ orders, onOpenReview }) {
  if (!orders.length) {
    return (
      <Card className="border-dashed shadow-none">
        <CardContent className="flex flex-col items-center justify-center gap-2 py-14 text-center">
          <p className="text-lg font-medium text-foreground">
            Chưa có giao dịch mua nào được ghi nhận.
          </p>
          <p className="max-w-md text-sm text-muted-foreground">
            Khi bạn mua hàng qua chat và người bán xác nhận &quot;Đã bán&quot;,
            lịch sử sẽ xuất hiện ở đây.
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
            Người bán
          </TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Giá trị
          </TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Ngày
          </TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Trạng thái
          </TableHead>
          <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Hành động
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const pid = order.productId?._id || order.productId;
          const sid = order.sellerId?._id || order.sellerId;
          const storeName = (order.sellerId?.sellerProfile?.storeName || "").trim();
          const sellerName = storeName || order.sellerId?.username || "—";
          const pName = order.productId?.name ?? "—";
          const hasReview = Boolean(order.hasReview);
          const code = order._id
            ? String(order._id).slice(-8).toUpperCase()
            : "—";
          return (
            <TableRow key={String(order._id)}>
              <TableCell className="font-mono text-sm">#{code}</TableCell>
              <TableCell className="max-w-[220px] whitespace-normal">
                {pid ? (
                  <Button
                    asChild
                    variant="link"
                    className="h-auto p-0 font-medium !text-amber-700 hover:!text-amber-800"
                  >
                    <Link to={`/product/${pid}`}>{pName}</Link>
                  </Button>
                ) : (
                  <span className="text-sm">{pName}</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {sellerName}
              </TableCell>
              <TableCell className="font-semibold text-destructive">
                {formatVnd(order.totalAmount)}
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
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
                  className="border-0 bg-emerald-100 font-semibold text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-200"
                >
                  {order.status === "COMPLETED" ? "Hoàn tất" : order.status}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                {order.status === "COMPLETED" && sid && pid ? (
                  hasReview ? (
                    <Badge
                      variant="secondary"
                      className="border-slate-200 bg-slate-100 font-normal text-slate-700 hover:bg-slate-100"
                    >
                      Đã đánh giá
                    </Badge>
                  ) : (
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto text-amber-600 underline-offset-4 hover:text-amber-700"
                      onClick={() => onOpenReview(order._id)}
                    >
                      Đánh giá
                    </Button>
                  )
                ) : (
                  <span className="text-sm italic text-muted-foreground">
                    —
                  </span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default PurchaseHistoryTable;

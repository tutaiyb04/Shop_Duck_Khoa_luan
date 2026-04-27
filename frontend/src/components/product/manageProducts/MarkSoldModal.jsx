import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { API } from "@/services/axios";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function MarkSoldModal({
  open,
  onOpenChange,
  product,
  onConfirmSold,
}) {
  const [candidates, setCandidates] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [selectedBuyerId, setSelectedBuyerId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !product?._id) {
      setCandidates([]);
      setSelectedBuyerId(null);
      return;
    }

    let cancelled = false;
    const pid = product._id;

    (async () => {
      setLoadingList(true);
      setSelectedBuyerId(null);
      try {
        const { data } = await API.get(
          `/chat/product/${pid}/sale-candidates`,
        );
        if (!cancelled) {
          setCandidates(Array.isArray(data.buyers) ? data.buyers : []);
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          toast.error(
            e.response?.data?.message || "Không tải được danh sách người đã chat",
          );
          setCandidates([]);
        }
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, product?._id]);

  const handleSubmit = async () => {
    if (!product?._id || !selectedBuyerId) return;
    setSubmitting(true);
    try {
      await onConfirmSold(product._id, selectedBuyerId);
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error(
        e.response?.data?.message ||
          "Không ghi nhận được giao dịch. Kiểm tra đã chat với người mua.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Đã bán — chọn người mua</DialogTitle>
          <DialogDescription>
            Duck Shop chỉ ghi nhận khi bạn chọn đúng tài khoản đã từng nhắn tin với bạn về món &quot;
            <span className="font-medium text-foreground">{product?.name}</span>
            &quot;. Hai bên sẽ thấy giao dịch trong Lịch sử mua/bán.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[min(52vh,320px)] overflow-y-auto space-y-2 py-1">
          {loadingList ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            </div>
          ) : candidates.length === 0 ? (
            <p className="text-sm text-muted-foreground rounded-lg border border-dashed bg-muted/30 px-3 py-4">
              Chưa có ai mở hội thoại về tin này. Hãy nhắn tin với người mua trong{" "}
              <strong>Tin nhắn</strong>, rồi quay lại bấm &quot;Đã bán&quot; và chọn đúng
              người.
            </p>
          ) : (
            candidates.map((row, idx) => {
              const id = row.user?._id ?? row.user?.id;
              const uid = id ? String(id) : "";
              const active = uid && selectedBuyerId === uid;
              return (
                <button
                  key={uid || `candidate-${idx}`}
                  type="button"
                  onClick={() => setSelectedBuyerId(uid)}
                  className={cn(
                    "w-full rounded-lg border px-3 py-3 text-left text-sm transition-colors",
                    active
                      ? "border-amber-500 bg-amber-50 ring-2 ring-amber-400/40"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  <span className="font-medium">{row.user?.username ?? "—"}</span>
                </button>
              );
            })
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button
            type="button"
            className="!bg-green-600 hover:!bg-green-700 text-white"
            disabled={
              submitting ||
              loadingList ||
              !selectedBuyerId ||
              candidates.length === 0
            }
            onClick={handleSubmit}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý…
              </>
            ) : (
              "Xác nhận đã bán"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

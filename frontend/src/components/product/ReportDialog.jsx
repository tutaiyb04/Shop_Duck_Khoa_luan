import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ShieldAlert } from "lucide-react";

function ReportDialog({ open, onOpenChange, onSend, isReporting }) {
  const [reason, setReason] = useState("");
  const [desc, setDesc] = useState("");

  const handleConfirm = async () => {
    const success = await onSend({ reason, description: desc });
    if (success) {
      setReason("");
      setDesc("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[42.5rem] rounded-[1.6rem] bg-white p-[2.4rem] gap-[1.6rem] border-none shadow-2xl">
        <DialogHeader className="space-y-[0.8rem]">
          <DialogTitle className="text-[2rem] font-bold text-yellow-600 flex items-center gap-[0.8rem]">
            <ShieldAlert className="w-[2.4rem] h-[2.4rem]" />
            Báo cáo vi phạm
          </DialogTitle>
          <DialogDescription className="text-[1.4rem] text-gray-500 leading-relaxed">
            Giúp hệ thống giữ môi trường giao dịch an toàn bằng cách báo cáo tin
            đăng có dấu hiệu lừa đảo hoặc vi phạm quy định.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-[1.6rem] py-[0.8rem]">
          <div className="grid gap-[0.8rem]">
            <Label
              htmlFor="reason"
              className="text-[1.4rem] font-bold text-gray-800"
            >
              Lý do báo cáo <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={setReason} value={reason}>
              <SelectTrigger
                id="reason"
                className="w-full h-[4rem] text-[1.4rem] rounded-[0.8rem]"
              >
                <SelectValue placeholder="-- Vui lòng chọn lý do --" />
              </SelectTrigger>
              <SelectContent className="rounded-[0.8rem]">
                <SelectItem
                  value="Hàng giả / Hàng nhái"
                  className="text-[1.4rem] cursor-pointer"
                >
                  Hàng giả / Hàng nhái
                </SelectItem>
                <SelectItem
                  value="Lừa đảo chiếm đoạt"
                  className="text-[1.4rem] cursor-pointer"
                >
                  Lừa đảo chiếm đoạt
                </SelectItem>
                <SelectItem
                  value="Ngôn từ đả kích / Phản cảm"
                  className="text-[1.4rem] cursor-pointer"
                >
                  Ngôn từ đả kích / Phản cảm
                </SelectItem>
                <SelectItem
                  value="Spam / Quảng cáo"
                  className="text-[1.4rem] cursor-pointer"
                >
                  Spam / Quảng cáo
                </SelectItem>
                <SelectItem
                  value="Sai danh mục"
                  className="text-[1.4rem] cursor-pointer"
                >
                  Sai danh mục
                </SelectItem>
                <SelectItem
                  value="Khác"
                  className="text-[1.4rem] cursor-pointer"
                >
                  Khác
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-[0.8rem]">
            <Label
              htmlFor="description"
              className="text-[1.4rem] font-bold text-gray-800"
            >
              Mô tả chi tiết <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Cung cấp thêm bằng chứng hoặc mô tả chi tiết lỗi để hệ thống xử lý nhanh hơn..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="min-h-[12rem] text-[1.4rem] resize-none rounded-[0.8rem] p-[1.2rem] focus-visible:ring-yellow-500"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-[1.2rem] sm:justify-end pt-[0.8rem]">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-[4rem] px-[1.6rem] text-[1.4rem] rounded-[0.8rem] !bg-gray-200 hover:!bg-gray-300 !border-1 !border-gray-200 !ring-0 !outline-none"
          >
            Hủy bỏ
          </Button>
          <Button
            className="h-[4rem] px-[2.4rem] text-[1.4rem] !bg-yellow-600 hover:!bg-yellow-700 text-white font-bold transition-colors rounded-[0.8rem] shadow-sm !border-1 !border-gray-200 !ring-0 !outline-none"
            disabled={!reason || isReporting}
            onClick={handleConfirm}
          >
            {isReporting ? "Đang gửi..." : "Gửi báo cáo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ReportDialog;

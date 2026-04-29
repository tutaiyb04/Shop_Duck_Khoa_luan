import { API } from "@/services/axios";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

const MAX_ATTACH = 5;

// mô tả lý do hội thoại bị đóng băng theo trạng thái sản phẩm
const frozenChatNotice = (productStatus) => {
  switch (productStatus) {
    case "SOLD":
      return {
        title: "Sản phẩm đã được đánh dấu Đã bán",
        description:
          "Hội thoại này đã đóng băng. Bạn không thể gửi thêm tin nhắn cho sản phẩm này.",
      };
    case "HIDDEN":
      return {
        title: "Sản phẩm đã được người bán ẩn",
        description:
          "Người bán đã ẩn sản phẩm. Bạn không thể gửi tin nhắn mới trong hội thoại này.",
      };
    case "LOCKED":
      return {
        title: "Sản phẩm đang bị khóa",
        description:
          "Quản trị viên đã khóa sản phẩm. Hội thoại tạm thời không thể gửi tin nhắn.",
      };
    case "REJECTED":
      return {
        title: "Sản phẩm đã bị từ chối",
        description:
          "Sản phẩm không được duyệt. Hội thoại này đã bị đóng băng.",
      };
    default:
      return {
        title: "Hội thoại đã bị đóng băng",
        description: "Bạn không thể gửi thêm tin nhắn trong hội thoại này.",
      };
  }
};

function useMessageThreadLogic({
  selectedId,
  thread,
  currentUid,
  selectedSummary,
  sendMessage,
}) {
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState([]); // { file, url }[] — url là object URL để preview
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  const fileInputRef = useRef(null);
  const attachmentsRef = useRef([]);

  // dọn dẹp URL rác để tránh rò rỉ bộ nhớ
  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  useEffect(() => {
    return () => {
      attachmentsRef.current.forEach((a) => URL.revokeObjectURL(a.url));
    };
  }, []);

  // xử lý thêm ảnh
  const addFiles = (fileList) => {
    if (!fileList?.length) return;
    const incoming = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/"),
    );
    setAttachments((prev) => {
      const room = MAX_ATTACH - prev.length;
      if (room <= 0) return prev;
      const slice = incoming.slice(0, room);
      const next = slice.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));
      return [...prev, ...next];
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // xử lý xóa ảnh
  const removeAttachment = (index) => {
    setAttachments((prev) => {
      const t = prev[index];
      if (t) URL.revokeObjectURL(t.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const canSend = Boolean(String(draft).trim()) || attachments.length > 0;

  // tính toán Id đối phương
  const opponentUserId = useMemo(() => {
    const parts = thread?.conversation?.participants;
    if (Array.isArray(parts) && currentUid) {
      const other = parts.find((p) => String(p) !== String(currentUid));
      if (other != null) return String(other);
    }
    if (selectedSummary?.otherUserId) {
      return String(selectedSummary.otherUserId);
    }
    return null;
  }, [thread, currentUid, selectedSummary]);

  // Tính toán ID sản phẩm hiển thị trên Header
  const headerProductId = useMemo(() => {
    const fromThread = thread?.conversation?.productId;
    if (fromThread != null && String(fromThread)) return String(fromThread);
    if (selectedSummary?.productId) return String(selectedSummary.productId);
    return null;
  }, [thread, selectedSummary]);

  // xác định hội thoại có đang bị đóng băng không
  const isFrozen = Boolean(
    thread?.conversation?.isFrozen ||
    selectedSummary?.isFrozen ||
    ["SOLD", "HIDDEN", "LOCKED", "REJECTED"].includes(
      thread?.conversation?.productStatus ||
        selectedSummary?.productStatus ||
        "",
    ),
  );

  const frozenStatus =
    thread?.conversation?.productStatus ||
    selectedSummary?.productStatus ||
    null;
  const frozenInfo = isFrozen ? frozenChatNotice(frozenStatus) : null;

  // xử lý gửi tố cáo
  const handleChatReportSend = async ({ reason, description }) => {
    if (!opponentUserId || !selectedId) return false;
    setIsReporting(true);
    try {
      await API.post("/reports/chat", {
        targetUserId: opponentUserId,
        reason,
        description,
        evidenceImages: [],
        conversationId: selectedId,
      });
      toast.success("Đã gửi tố cáo. Cảm ơn bạn đã giúp cộng đồng an toàn hơn.");
      return true;
    } catch (e) {
      toast.error(
        e?.response?.data?.message || e?.message || "Gửi tố cáo thất bại",
      );
      return false;
    } finally {
      setIsReporting(false);
    }
  };

  // Xử lý submit form gửi tin nhắn (gom logic vào hook cho UI gọn) Tham số `sending` được component truyền vào để chặn double-submit khi request trước đang chạy (state `sending` thuộc useChatInbox).
  const handleFormSubmit = async (e, sending) => {
    e.preventDefault();
    if (!canSend || sending || isFrozen) return;
    const files = attachments.map((a) => a.file);
    const ok = await sendMessage({ text: draft, files });
    if (ok) {
      setDraft("");
      attachments.forEach((a) => URL.revokeObjectURL(a.url));
      setAttachments([]);
    }
  };

  return {
    draft,
    setDraft,
    attachments,
    fileInputRef,
    addFiles,
    removeAttachment,
    canSend,
    isReportOpen,
    setIsReportOpen,
    isReporting,
    opponentUserId,
    headerProductId,
    isFrozen,
    frozenStatus,
    frozenInfo,
    handleChatReportSend,
    handleFormSubmit,
    MAX_ATTACH,
  };
}

export default useMessageThreadLogic;

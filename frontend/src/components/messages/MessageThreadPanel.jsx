import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Send, ShieldAlert, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API } from "@/services/axios";
import ReportDialog from "@/components/product/productDetails/ReportDialog";
import LoadingBlock from "@/components/shared/LoadingBlock";
import toast from "react-hot-toast";

const MAX_ATTACH = 5;

export default function MessageThreadPanel({
  selectedId,
  thread,
  loadingThread,
  errorThread,
  currentUid,
  sending,
  sendError,
  sendMessage,
  hideConversation,
  /** Khi API thread lỗi: vẫn có productId / đối phương từ danh sách trái */
  selectedSummary = null,
}) {
  const [draft, setDraft] = useState("");
  /** { file, url }[] — url là object URL để preview */
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const attachmentsRef = useRef([]);
  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  useEffect(() => {
    return () => {
      attachmentsRef.current.forEach((a) => URL.revokeObjectURL(a.url));
    };
  }, []);

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

  const removeAttachment = (index) => {
    setAttachments((prev) => {
      const t = prev[index];
      if (t) URL.revokeObjectURL(t.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const canSend = Boolean(String(draft).trim()) || attachments.length > 0;

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

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

  const headerProductId = useMemo(() => {
    const fromThread = thread?.conversation?.productId;
    if (fromThread != null && String(fromThread)) return String(fromThread);
    if (selectedSummary?.productId) return String(selectedSummary.productId);
    return null;
  }, [thread, selectedSummary]);

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

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-transparent">
      {!selectedId && (
        <div className="flex min-h-[200px] flex-1 items-center justify-center p-6 text-sm text-gray-500 lg:min-h-0">
          Chọn một hội thoại bên trái
        </div>
      )}

      {selectedId && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 p-3">
            <div className="min-w-0 flex-1">
              {loadingThread ? (
                <LoadingBlock message="Đang tải…" className="py-0 text-left" />
              ) : (
                <span className="text-sm font-medium text-gray-800">
                  {headerProductId
                    ? `Hội thoại · sản phẩm #${headerProductId.slice(-6)}`
                    : selectedId
                      ? `Hội thoại #${String(selectedId).slice(-6)}`
                      : "—"}
                </span>
              )}
              {errorThread && (
                <p className="mt-1 text-sm text-red-600">{errorThread}</p>
              )}
            </div>
            {!loadingThread && (
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {opponentUserId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 !border-amber-200 !bg-amber-200 text-amber-800 hover:!bg-amber-300 !transition-colors"
                    onClick={() => setIsReportOpen(true)}
                    title="Tố cáo người dùng"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    Tố cáo
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 !border-gray-200 !bg-gray-200 text-gray-700 hover:!bg-red-100 hover:text-red-700 !transition-colors"
                  title="Ẩn hội thoại khỏi danh sách (xóa mềm)"
                  onClick={async () => {
                    if (
                      !selectedId ||
                      !window.confirm(
                        "Ẩn hội thoại này khỏi danh sách của bạn? Tin nhắn vẫn được giữ; đối phương không bị ảnh hưởng. Bạn có thể thấy lại khi có tin mới hoặc mở chat từ trang sản phẩm.",
                      )
                    ) {
                      return;
                    }
                    const ok = await hideConversation(selectedId);
                    if (ok) {
                      toast.success("Đã ẩn hội thoại.");
                    } else {
                      toast.error("Không ẩn được hội thoại.");
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa
                </Button>
              </div>
            )}
          </div>

          <ReportDialog
            open={isReportOpen}
            onOpenChange={setIsReportOpen}
            onSend={handleChatReportSend}
            isReporting={isReporting}
            variant="chat"
          />

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            {thread?.messages?.map((m) => {
              const mine = m.sender?.id === currentUid;
              const imgs = m.images?.length ? m.images : [];
              return (
                <div
                  key={m.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm shadow-sm ${
                      mine
                        ? "bg-yellow-600 text-white"
                        : "border-1 border-gray-300 bg-white text-gray-900"
                    }`}
                  >
                    {!mine && (
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-500">
                        {m.sender?.username}
                      </p>
                    )}
                    {m.text ? (
                      <p className="whitespace-pre-wrap break-words">
                        {m.text}
                      </p>
                    ) : null}
                    {imgs.length > 0 && (
                      <div
                        className={`mt-1.5 grid gap-1.5 ${
                          imgs.length > 1 ? "grid-cols-2" : "grid-cols-1"
                        }`}
                      >
                        {imgs.map((src, i) => (
                          <a
                            key={i}
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block overflow-hidden rounded-lg ring-1 ring-black/5"
                          >
                            <img
                              src={src}
                              alt=""
                              className="max-h-44 w-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-100 bg-gray-50/80 p-3">
            {attachments.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {attachments.map((a, i) => (
                  <div
                    key={a.url}
                    className="relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                  >
                    <img
                      src={a.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                      aria-label="Bỏ ảnh"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <form
              className="flex flex-col gap-2 sm:flex-row sm:items-end"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!canSend || sending) return;
                const files = attachments.map((a) => a.file);
                const ok = await sendMessage({
                  text: draft,
                  files,
                });
                if (ok) {
                  setDraft("");
                  attachments.forEach((a) => URL.revokeObjectURL(a.url));
                  setAttachments([]);
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                multiple
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
              <div className="flex min-w-0 flex-1 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={sending || attachments.length >= MAX_ATTACH}
                  className="shrink-0 !bg-amber-200 hover:!bg-amber-300 !border-0 !ring-0 !outline-none !transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  title="Đính kèm ảnh"
                >
                  <ImagePlus className="h-4 w-4 text-black" />
                </Button>
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Nhập tin nhắn (tuỳ chọn — có thể chỉ gửi ảnh)"
                  disabled={sending}
                  className="min-w-0 flex-1 border-gray-200 bg-white focus-visible:border-amber-500 focus-visible:ring-amber-500/30"
                />
              </div>
              <Button
                type="submit"
                disabled={sending || !canSend}
                className="shrink-0 gap-1.5 !bg-amber-500 text-white hover:!bg-amber-600 sm:min-w-[88px] !border-0 !ring-0 !outline-none !transition-colors"
              >
                {sending ? (
                  "…"
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Gửi
                  </>
                )}
              </Button>
            </form>
            {sendError && (
              <p className="mt-2 text-xs text-red-600">{sendError}</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}

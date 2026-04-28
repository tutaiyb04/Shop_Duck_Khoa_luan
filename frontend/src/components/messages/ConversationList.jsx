function formatLastMessageLine(c, myId) {
  const text = (c.lastMessage || "").trim();
  if (!text) return "Chưa có tin nhắn";
  const sid = c.lastMessageSenderId ? String(c.lastMessageSenderId) : "";
  if (!sid) return text;
  const label =
    sid === String(myId)
      ? "Bạn"
      : c.lastMessageSenderUsername || c.otherParticipant?.username || "?";
  return `${label}: ${text}`;
}

import LoadingBlock from "@/components/shared/LoadingBlock";

/**
 * Cột danh sách hội thoại (bên trái).
 */
export default function ConversationList({
  conversations,
  currentUserId,
  loadingList,
  errorList,
  selectedId,
  onSelectId,
}) {
  return (
    <aside className="flex max-h-[min(520px,55vh)] w-full min-h-0 shrink-0 flex-col bg-transparent lg:h-full lg:max-h-none lg:w-[320px]">
      <div className="border-b border-slate-100 bg-slate-50/50 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Hội thoại
      </div>
      {loadingList && (
        <div className="px-1">
          <LoadingBlock
            message="Đang tải danh sách hội thoại…"
            className="py-6 text-left text-sm"
          />
        </div>
      )}
      {errorList && <p className="p-3 text-sm text-red-600">{errorList}</p>}
      {!loadingList && !errorList && conversations.length === 0 && (
        <p className="p-3 text-sm text-gray-500">Chưa có hội thoại.</p>
      )}
      <ul className="mb-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto bg-white px-2 py-2">
        {conversations.map((c) => {
          const active = c.id === selectedId;
          const img = c.product?.images?.[0];
          const unread = c.unreadForMe > 0;
          return (
            <li key={c.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onSelectId(c.id)}
                className={`flex w-full gap-3 rounded-lg !border-0 !ring-0 !outline-none px-3 py-3 text-left !transition-colors ${
                  active ? "!bg-yellow-100" : "!bg-gray-200 hover:!bg-amber-100"
                }`}
              >
                <div
                  className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-2 ring-offset-1 ${
                    active ? "ring-amber-400" : "ring-transparent"
                  }`}
                >
                  {img ? (
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                      SP
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1 py-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-semibold leading-tight text-slate-900">
                      Sản phẩm: {c.product?.name || "Sản phẩm"}
                    </p>
                    {unread && (
                      <span className="mt-0.5 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white shadow-sm">
                        {c.unreadForMe > 99 ? "99+" : c.unreadForMe}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-xs leading-snug text-slate-500">
                    {formatLastMessageLine(c, currentUserId)}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

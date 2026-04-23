import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserSidebar from "@/components/shared/UserSidebar";
import { getSocket } from "@/services/socket";
import { AuthContext } from "@/context/AuthContext";
import { useChatInbox } from "@/hooks/chatHooks/useChatInbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function MessagesForUser() {
  const { user } = useContext(AuthContext);
  const [socketStatus, setSocketStatus] = useState("—");
  const [draft, setDraft] = useState("");

  const {
    conversations,
    loadingList,
    errorList,
    selectedId,
    setSelectedId,
    thread,
    loadingThread,
    errorThread,
    sending,
    sendError,
    sendText,
  } = useChatInbox();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      queueMicrotask(() =>
        setSocketStatus("Thiếu token — hãy đăng nhập lại"),
      );
      return undefined;
    }

    const onConnect = () =>
      setSocketStatus("Socket: OK (xác thực JWT trên server)");
    const onDisconnect = () => setSocketStatus("Socket: mất kết nối");
    const onConnectError = (err) =>
      setSocketStatus(
        err?.message ? `Socket lỗi: ${err.message}` : "Socket lỗi kết nối",
      );

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  }, [user]);

  const currentUid = String(user?._id ?? user?.id ?? "");

  return (
    <div className="container mx-auto px-4 py-20 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-6">
        <UserSidebar />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold mb-3 text-gray-800">Tin nhắn</h1>
          <p className="text-xs text-gray-400 mb-3">{socketStatus}</p>

          <div className="flex flex-col lg:flex-row gap-4 min-h-[420px]">
            {/* Cột trái: danh sách hội thoại */}
            <aside className="w-full lg:w-[320px] shrink-0 rounded-lg border border-gray-200 bg-white shadow-sm flex flex-col max-h-[520px]">
              <div className="p-3 border-b border-gray-100 font-medium text-sm text-gray-800">
                Hội thoại
              </div>
              {loadingList && (
                <p className="p-3 text-sm text-gray-500">Đang tải…</p>
              )}
              {errorList && (
                <p className="p-3 text-sm text-red-600">{errorList}</p>
              )}
              {!loadingList && !errorList && conversations.length === 0 && (
                <p className="p-3 text-sm text-gray-500">
                  Chưa có hội thoại. (Cần tạo từ trang sản phẩm nếu app có tính
                  năng mở chat.)
                </p>
              )}
              <ul className="overflow-y-auto flex-1">
                {conversations.map((c) => {
                  const active = c.id === selectedId;
                  const img = c.product?.images?.[0];
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(c.id)}
                        className={`w-full text-left p-3 flex gap-2 border-b border-gray-50 hover:bg-amber-50/80 transition-colors ${
                          active ? "bg-amber-100/80" : ""
                        }`}
                      >
                        <div className="h-12 w-12 shrink-0 rounded-md bg-gray-100 overflow-hidden">
                          {img ? (
                            <img
                              src={img}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {c.product?.name || "Sản phẩm"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {c.otherParticipant?.username || "—"}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {c.lastMessage || " "}
                          </p>
                        </div>
                        {c.unreadForMe > 0 && (
                          <span className="self-center h-5 min-w-5 rounded-full bg-yellow-500 text-white text-[10px] flex items-center justify-center px-1">
                            {c.unreadForMe}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>

            {/* Cột phải: nội dung chat */}
            <section className="flex-1 min-w-0 rounded-lg border border-gray-200 bg-white shadow-sm flex flex-col min-h-[420px]">
              {!selectedId && (
                <div className="flex-1 flex items-center justify-center p-6 text-sm text-gray-500">
                  Chọn một hội thoại bên trái
                </div>
              )}

              {selectedId && (
                <>
                  <div className="p-3 border-b border-gray-100">
                    {loadingThread ? (
                      <span className="text-sm text-gray-500">Đang tải…</span>
                    ) : (
                      <span className="text-sm font-medium text-gray-800">
                        {thread?.conversation
                          ? `Hội thoại · sản phẩm #${String(thread.conversation.productId).slice(-6)}`
                          : "—"}
                      </span>
                    )}
                    {errorThread && (
                      <p className="text-sm text-red-600 mt-1">{errorThread}</p>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[320px]">
                    {thread?.messages?.map((m) => {
                      const mine = m.sender?.id === currentUid;
                      return (
                        <div
                          key={m.id}
                          className={`flex ${mine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                              mine
                                ? "bg-yellow-500 text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            {!mine && (
                              <p className="text-[10px] opacity-80 mb-0.5">
                                {m.sender?.username}
                              </p>
                            )}
                            {m.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <form
                    className="p-3 border-t border-gray-100 flex gap-2"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const ok = await sendText(draft);
                      if (ok) setDraft("");
                    }}
                  >
                    <Input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Nhập tin nhắn…"
                      disabled={sending}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={sending || !draft.trim()}
                      className="!bg-yellow-500 hover:!bg-yellow-600 text-white"
                    >
                      {sending ? "…" : "Gửi"}
                    </Button>
                  </form>
                  {sendError && (
                    <p className="px-3 pb-2 text-xs text-red-600">
                      {sendError}
                    </p>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Messages() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-6xl">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg border shadow-sm">
          <h1 className="text-xl font-bold text-gray-800 mb-2">Tin nhắn</h1>
          <p className="text-sm text-gray-600 mb-4">
            Đăng nhập để xem hội thoại.
          </p>
          <Link
            to="/login"
            className="inline-block text-sm font-medium text-yellow-600 hover:underline"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return <MessagesForUser key={String(user._id ?? user.id)} />;
}

export default Messages;

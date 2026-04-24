import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { API } from "@/services/axios";
import { getSocket } from "@/services/socket";
import { CHAT_CONVERSATION_UPDATED_EVENT } from "@/constants/chatSocket";

function isObjectIdString(s) {
  return (
    typeof s === "string" && /^[a-f\d]{24}$/i.test(s.replace(/\s/g, ""))
  );
}

export function useChatInbox() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [errorList, setErrorList] = useState("");

  const [selectedId, setSelectedId] = useState(null);
  const [thread, setThread] = useState(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [errorThread, setErrorThread] = useState("");

  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const selectedIdRef = useRef(null);
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const loadConversations = useCallback(async (opts = {}) => {
    const silent = Boolean(opts.silent);
    if (!silent) setLoadingList(true);
    setErrorList("");
    try {
      const res = await API.get("/chat/conversations");
      setConversations(res.data.conversations || []);
    } catch (e) {
      setErrorList(
        e?.response?.data?.message || e?.message || "Không tải được hội thoại",
      );
    } finally {
      if (!silent) setLoadingList(false);
    }
  }, []);

  const loadThread = useCallback(
    async (conversationId) => {
      if (!conversationId) {
        setThread(null);
        return;
      }
      setLoadingThread(true);
      setErrorThread("");
      try {
        const res = await API.get(`/chat/${conversationId}`);
        setThread(res.data);
        await loadConversations({ silent: true });
      } catch (e) {
        setErrorThread(
          e?.response?.data?.message || e?.message || "Không tải được tin nhắn",
        );
        setThread(null);
      } finally {
        setLoadingThread(false);
      }
    },
    [loadConversations],
  );

  // Mở sẵn hội thoại khi vào từ trang sản phẩm: /messages?c=<conversationId>
  useEffect(() => {
    const c = searchParams.get("c");
    if (!c || !isObjectIdString(c)) {
      return;
    }
    setSelectedId(c);
    setSearchParams(
      (prev) => {
        const n = new URLSearchParams(prev);
        n.delete("c");
        return n;
      },
      { replace: true },
    );
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (selectedId) {
      loadThread(selectedId);
    } else {
      setThread(null);
    }
  }, [selectedId, loadThread]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      return undefined;
    }
    const onConversationUpdated = (payload) => {
      const cid = payload?.conversationId
        ? String(payload.conversationId)
        : "";
      void loadConversations({ silent: true });
      if (cid && selectedIdRef.current === cid) {
        void loadThread(cid);
      }
    };
    socket.on(CHAT_CONVERSATION_UPDATED_EVENT, onConversationUpdated);
    return () => {
      socket.off(CHAT_CONVERSATION_UPDATED_EVENT, onConversationUpdated);
    };
  }, [loadConversations, loadThread]);

  const uploadChatImages = useCallback(async (files) => {
    const fd = new FormData();
    for (const f of files) {
      fd.append("images", f);
    }
    const res = await API.post("/chat/upload-images", fd);
    return res.data.urls || [];
  }, []);

  const sendMessage = useCallback(
    async ({ text = "", files = [] }) => {
      if (!selectedId) return false;
      const trimmed = String(text).trim();
      const fileArr = Array.isArray(files) ? files : [];
      if (!trimmed && fileArr.length === 0) return false;
      setSending(true);
      setSendError("");
      try {
        let imageUrls = [];
        if (fileArr.length > 0) {
          imageUrls = await uploadChatImages(fileArr);
          if (imageUrls.length === 0) {
            setSendError(
              "Không tải được ảnh lên. Thử lại hoặc dùng JPG/PNG.",
            );
            return false;
          }
        }
        await API.post("/chat/message", {
          conversationId: selectedId,
          text: trimmed,
          images: imageUrls,
        });
        await loadThread(selectedId);
        await loadConversations({ silent: true });
        return true;
      } catch (e) {
        setSendError(
          e?.response?.data?.message || e?.message || "Gửi thất bại",
        );
        return false;
      } finally {
        setSending(false);
      }
    },
    [selectedId, loadThread, loadConversations, uploadChatImages],
  );

  return {
    conversations,
    loadingList,
    errorList,
    refetchList: loadConversations,
    selectedId,
    setSelectedId,
    thread,
    loadingThread,
    errorThread,
    sending,
    sendError,
    sendMessage,
  };
}

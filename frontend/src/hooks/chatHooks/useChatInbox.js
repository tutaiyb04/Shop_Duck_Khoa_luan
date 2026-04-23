import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { API } from "@/services/axios";

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

  const loadConversations = useCallback(async () => {
    setLoadingList(true);
    setErrorList("");
    try {
      const res = await API.get("/chat/conversations");
      setConversations(res.data.conversations || []);
    } catch (e) {
      setErrorList(
        e?.response?.data?.message || e?.message || "Không tải được hội thoại",
      );
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadThread = useCallback(async (conversationId) => {
    if (!conversationId) {
      setThread(null);
      return;
    }
    setLoadingThread(true);
    setErrorThread("");
    try {
      const res = await API.get(`/chat/${conversationId}`);
      setThread(res.data);
    } catch (e) {
      setErrorThread(
        e?.response?.data?.message || e?.message || "Không tải được tin nhắn",
      );
      setThread(null);
    } finally {
      setLoadingThread(false);
    }
  }, []);

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

  const sendText = useCallback(
    async (text) => {
      if (!selectedId || !String(text).trim()) return false;
      setSending(true);
      setSendError("");
      try {
        await API.post("/chat/message", {
          conversationId: selectedId,
          text: String(text).trim(),
        });
        await loadThread(selectedId);
        await loadConversations();
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
    [selectedId, loadThread, loadConversations],
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
    sendText,
  };
}

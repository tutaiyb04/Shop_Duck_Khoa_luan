import { useContext, useMemo } from "react";
import UserSidebar from "@/components/shared/UserSidebar";
import { AuthContext } from "@/context/AuthContext";
import { useChatInbox } from "@/hooks/chatHooks/useChatInbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ConversationList from "./ConversationList";
import MessageThreadPanel from "./MessageThreadPanel";

export default function MessagesForUser() {
  const { user } = useContext(AuthContext);
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
    sendMessage,
    hideConversation,
  } = useChatInbox();

  const currentUid = String(user?._id ?? user?.id ?? "");

  const selectedSummary = useMemo(() => {
    if (!selectedId) return null;
    const c = conversations.find((x) => x.id === selectedId);
    if (!c) return null;
    return {
      productId: c.product?.id ?? null,
      otherUserId: c.otherParticipant?.id ?? null,
    };
  }, [conversations, selectedId]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-20">
      <div className="flex flex-col gap-6 md:flex-row">
        <UserSidebar />
        <div className="min-w-0 flex-1">
          <Card className="mb-4 gap-0 border-gray-200 bg-white py-4 shadow-sm">
            <CardHeader className="border-0 p-0 px-6 pb-0">
              <CardTitle className="text-2xl font-bold text-gray-800">
                Tin nhắn
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="gap-0 overflow-hidden border-gray-200 bg-white py-0 shadow-sm">
            <CardContent className="flex min-h-[420px] flex-col divide-y divide-gray-100 p-0 lg:h-[520px] lg:min-h-[520px] lg:flex-row lg:divide-x lg:divide-y-0">
              <ConversationList
                conversations={conversations}
                currentUserId={currentUid}
                loadingList={loadingList}
                errorList={errorList}
                selectedId={selectedId}
                onSelectId={setSelectedId}
              />
              <MessageThreadPanel
                key={selectedId || "no-thread"}
                selectedId={selectedId}
                thread={thread}
                loadingThread={loadingThread}
                errorThread={errorThread}
                currentUid={currentUid}
                sending={sending}
                sendError={sendError}
                sendMessage={sendMessage}
                hideConversation={hideConversation}
                selectedSummary={selectedSummary}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

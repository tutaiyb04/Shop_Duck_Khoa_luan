import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserSidebar from "@/components/shared/UserSidebar";
import { getSocket } from "@/services/socket";
import { AuthContext } from "@/context/AuthContext";

function MessagesForUser() {
  const { user } = useContext(AuthContext);
  const [socketStatus, setSocketStatus] = useState("Đang kết nối…");

  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      queueMicrotask(() =>
        setSocketStatus("Thiếu token — hãy đăng nhập lại"),
      );
      return undefined;
    }

    const userId = String(user?._id ?? user?.id ?? "");

    const onConnect = () => {
      setSocketStatus("Đã kết nối (Socket.io)");
      if (userId) {
        socket.emit("addNewUser", userId);
      }
    };

    const onDisconnect = () => setSocketStatus("Mất kết nối");
    const onConnectError = (err) =>
      setSocketStatus(
        err?.message ? `Lỗi: ${err.message}` : "Lỗi kết nối",
      );

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-20 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-6">
        <UserSidebar />
        <div className="flex-1 bg-white rounded-lg shadow-sm border p-6 min-h-[320px]">
          <h1 className="text-2xl font-bold mb-2 text-gray-800">Tin nhắn</h1>
          <p className="text-sm text-gray-500 mb-2">
            Danh sách hội thoại sẽ hiển thị tại đây.
          </p>
          <p className="text-xs text-gray-400">{socketStatus}</p>
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
            Đăng nhập để kết nối tin nhắn thời gian thực.
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

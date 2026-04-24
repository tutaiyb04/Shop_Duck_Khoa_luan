import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import MessagesForUser from "../../components/messages/MessagesForUser";

export default function Messages() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-md rounded-lg border bg-white p-8 text-center shadow-sm">
          <h1 className="mb-2 text-xl font-bold text-gray-800">Tin nhắn</h1>
          <p className="mb-4 text-sm text-gray-600">
            Đăng nhập để xem hội thoại.
          </p>
          <NavLink
            to="/login"
            className="inline-block text-sm font-medium text-yellow-600 hover:underline"
          >
            Đăng nhập
          </NavLink>
        </div>
      </div>
    );
  }

  return <MessagesForUser key={String(user._id ?? user.id)} />;
}

import { useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { AuthContext } from "@/context/AuthContext";
import { ClipboardList, User } from "lucide-react";
import UserAvatar from "./UserAvatar";

function UserSidebar() {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  // Danh sách các trang trong khu vực quản lý
  const navItems = [
    { path: "/profile", label: "Thông tin cá nhân", icon: User },
    { path: "/orders", label: "Đơn mua", icon: ClipboardList },
  ];

  return (
    <div className="w-full md:w-64 shrink-0 bg-white rounded-lg p-4 shadow-sm h-fit border-1">
      {/* Avatar & Tên user */}
      <div className="flex items-center gap-3 pb-4 border-b mb-4">
        <UserAvatar
          className="h-15 w-15 border shadow-sm text-lg"
          user={user}
        />

        <div className="flex flex-col overflow-hidden">
          <span className="font-semibold text-gray-800 truncate">
            {user?.username}
          </span>
        </div>
      </div>

      {/* Danh sách Menu */}
      <div className="flex flex-col space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          // So sánh đường dẫn hiện tại với path của menu để tạo hiệu ứng Active
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm !text-black font-medium ${
                isActive
                  ? " bg-gray-200" // Màu chữ và nền khi đang chọn
                  : " hover:!text-yellow-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

export default UserSidebar;

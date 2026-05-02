import { useContext } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { AuthContext } from "@/context/AuthContext";
import {
  ClipboardList,
  User,
  PlusCircle,
  Heart,
  ShieldCheck,
  List,
  MessagesSquare,
  Store,
  History,
  LogOut,
} from "lucide-react";
import UserAvatar from "./UserAvatar";

function UserSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  // Danh sách Menu theo từng nhóm trang trong khu vực quản lý
  const navGroups = [
    {
      title: "Thông tin cơ bản",
      items: [
        { path: "/profile", label: "Thông tin cá nhân", icon: User },
        { path: "/messages", label: "Tin nhắn", icon: MessagesSquare },
      ],
    },
    {
      title: "Bán hàng",
      items: [
        {
          path: "/seller-profile",
          label: "Thông tin người bán",
          icon: Store,
        },
        { path: "/sell", label: "Đăng tin bán", icon: PlusCircle },
        {
          path: "/sales-history",
          label: "Lịch sử bán hàng",
          icon: History,
        },
        { path: "/my-products", label: "Tất cả sản phẩm", icon: List },
        {
          path: "/verify",
          label: "Xác minh tài khoản",
          icon: ShieldCheck,
          // Hiện badge thông báo nếu chưa verify
          badge: !user?.isEmailVerified && user?.authType === "local",
        },
      ],
    },
    {
      title: "Mua hàng",
      items: [
        { path: "/orders", label: "Lịch sử mua hàng", icon: ClipboardList },
        { path: "/wishlist", label: "Sản phẩm yêu thích", icon: Heart },
      ],
    },
  ];

  return (
    <div className="w-full md:w-64 shrink-0 bg-white rounded-lg p-4 shadow-sm h-fit border-1">
      {/* Avatar & Tên user */}
      <div className="flex items-center gap-3 pb-4 mb-4">
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
      <div className="flex flex-col">
        {navGroups.map((group, groupIndex) => (
          <div
            key={groupIndex}
            className={
              groupIndex > 0 ? "mt-4 pt-4 border-t border-gray-200" : "mt-2"
            }
          >
            {group.title && (
              <h3 className="px-3 text-[18px] font-bold text-black mb-2">
                {group.title}
              </h3>
            )}

            <div className="flex flex-col space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                      isActive
                        ? "!bg-gray-200 !text-black" // Trạng thái đang chọn
                        : "!text-gray-600 hover:!bg-gray-100 hover:!text-yellow-600" // Trạng thái bình thường
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="flex w-full items-center gap-3 px-3 py-2.5 !transition-colors text-sm font-medium !bg-white !text-gray-600 hover:!bg-gray-100 hover:!text-yellow-600 !border-0"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

export default UserSidebar;

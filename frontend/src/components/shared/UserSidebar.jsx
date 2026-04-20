import { useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { AuthContext } from "@/context/AuthContext";
import { ClipboardList, User, PlusCircle, Heart } from "lucide-react";
import UserAvatar from "./UserAvatar";

function UserSidebar() {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  // Danh sách Menu theo từng nhóm trang trong khu vực quản lý
  const navGroups = [
    {
      title: "", // Nhóm không có tiêu đề, tự động nằm trên cùng
      items: [{ path: "/profile", label: "Thông tin cá nhân", icon: User }],
    },
    {
      title: "Bán hàng",
      items: [
        { path: "/sell", label: "Đăng tin bán", icon: PlusCircle },
        // GỢI Ý: Sau này thêm chức năng thì paste vào đây
        // { path: "/my-products", label: "Sản phẩm đang bán", icon: Package },
        // { path: "/sales-orders", label: "Đơn khách đặt", icon: ShoppingBag },
      ],
    },
    {
      title: "Mua hàng",
      items: [
        { path: "/orders", label: "Đơn hàng của tôi", icon: ClipboardList },
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
    </div>
  );
}

export default UserSidebar;

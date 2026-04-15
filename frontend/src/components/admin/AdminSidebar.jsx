import { NavLink } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  LayoutDashboard,
  Store,
  Package,
  Tag,
  Users,
} from "lucide-react";

const menuItems = [
  {
    icon: <LayoutDashboard size={20} />,
    label: "Tổng quan",
    path: "/admin/dashboard",
  },
  { icon: <Tag size={20} />, label: "Danh mục", path: "/admin/categories" }, // UC-6.1
  { icon: <Users size={20} />, label: "Người dùng", path: "/admin/users" },
  { icon: <Package size={20} />, label: "Sản phẩm", path: "/admin/products" },
  {
    icon: <AlertTriangle size={20} />,
    label: "Báo cáo vi phạm",
    path: "/admin/reports",
  },
  { icon: <BarChart3 size={20} />, label: "Doanh thu", path: "/admin/revenue" },
];

function AdminSidebar() {
  return (
    <div className="w-64 min-h-screen bg-gray-200w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm z-10 text-white flex flex-col">
      <div className="h-16 flex items-center justify-center px-6 border-b border-gray-200 bg-yellow-500">
        <Store className="text-white mr-3" size={24} />
        <h2 className="text-xl font-bold text-white tracking-wide">
          Duck Shop
        </h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-gray-300 !text-black"
                  : "!text-black hover:!bg-gray-100 hover:!text-yellow-700"
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default AdminSidebar;

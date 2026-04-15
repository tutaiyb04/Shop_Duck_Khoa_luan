import { NavLink } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  LayoutDashboard,
  Store,
  Package,
  Tag,
  Users,
  X,
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

function AdminSidebar({ isOpen, setIsOpen }) {
  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-yellow-500">
        <div className="flex items-center">
          <Store className="text-white mr-3" size={24} />
          <h2 className="text-xl font-bold text-white tracking-wide">
            Duck Shop
          </h2>
          <button
            className="lg:hidden text-gray-500 hover:text-gray-800 !bg-transparent transition-colors !border !border-transparent !ring-0 !outline-none"
            onClick={() => setIsOpen(false)}
          >
            <X size={25} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsOpen(false)} // Tự đóng khi click trên mobile
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-gray-200 !text-black font-semibold"
                  : "!text-gray-700 hover:bg-gray-100 hover:!text-yellow-700 font-medium"
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default AdminSidebar;

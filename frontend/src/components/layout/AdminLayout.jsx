import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Tags, Users, Package } from "lucide-react";

export default function AdminLayout() {
  const location = useLocation();

  const menuItems = [
    { name: "Tổng quan", path: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "Danh mục", path: "/admin/categories", icon: <Tags size={20} /> },
    { name: "Sản phẩm", path: "/admin/products", icon: <Package size={20} /> },
    { name: "Người dùng", path: "/admin/users", icon: <Users size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-amber-600">Duck Shop Admin</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-amber-50 text-amber-600 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content (Nơi hiển thị các trang con) */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}

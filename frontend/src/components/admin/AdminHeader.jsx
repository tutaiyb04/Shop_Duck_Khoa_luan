import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { ChevronDown, ExternalLink, LogOut, UserCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

function AdminHeader() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8 sticky top-0 z-30 shadow-sm">
      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <NavLink
          to="/"
          target="_blank"
          className="flex items-center gap-2 text-sm font-medium !text-gray-600 hover:!text-yellow-600 transition-colors"
        >
          <ExternalLink size={16} />
          <span>Xem cửa hàng</span>
        </NavLink>

        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        {/* Thông tin Admin */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-center !p-0 gap-2 group !bg-transparent !border-0 !ring-0 !outline-none cursor-pointer">
            <Avatar className="w-9 h-9 border border-gray-200 shadow-sm">
              <AvatarImage
                src={user?.avatar}
                alt={user?.username}
                className="object-cover"
              />

              <AvatarFallback className="bg-yellow-100 text-yellow-700 font-bold">
                {user?.username?.charAt(0).toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>

            <p className="text-sm font-bold text-gray-700 leading-none mb-1">
              {user?.username || "Admin"}
            </p>

            <ChevronDown
              size={16}
              className="text-gray-400 group-hover:text-gray-600 ml-1 transition-colors"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 mt-2">
            <DropdownMenuItem
              onClick={() => navigate("/admin/profile")}
              className="cursor-pointer"
            >
              <UserCircle className="mr-2 h-4 w-4" /> Hồ sơ Admin
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default AdminHeader;

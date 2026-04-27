import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  UserCircle,
  CirclePlus,
  List,
  ShieldCheck,
  Package,
  Heart,
  LogOut,
  MessagesSquare,
  Store,
} from "lucide-react";

function UserMenuLinks({ navigate, handleLogout }) {
  return (
    <>
      <DropdownMenuLabel>Thông tin cơ bản</DropdownMenuLabel>
      <DropdownMenuItem
        onClick={() => navigate("/profile")}
        className="cursor-pointer"
      >
        <UserCircle className="mr-2 h-4 w-4" />
        <span>Thông tin cá nhân</span>
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => navigate("/messages")}
        className="cursor-pointer"
      >
        <MessagesSquare className="mr-2 h-4 w-4" />
        <span>Tin nhắn</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />

      <DropdownMenuLabel>Bán hàng</DropdownMenuLabel>
      <DropdownMenuItem
        onClick={() => navigate("/seller-profile")}
        className="cursor-pointer"
      >
        <Store className="mr-2 h-4 w-4" />
        <span>Thông tin người bán</span>
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => navigate("/sell")}
        className="cursor-pointer"
      >
        <CirclePlus className="mr-2 h-4 w-4" />
        <span>Đăng tin bán</span>
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => navigate("/my-products")}
        className="cursor-pointer"
      >
        <List className="mr-2 h-4 w-4" />
        <span>Tất cả sản phẩm</span>
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => navigate("/verify")}
        className="cursor-pointer"
      >
        <ShieldCheck className="mr-2 h-4 w-4" />
        <span>Xác minh tài khoản</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />

      <DropdownMenuLabel>Mua hàng</DropdownMenuLabel>
      <DropdownMenuItem
        onClick={() => navigate("/orders")}
        className="cursor-pointer"
      >
        <Package className="mr-2 h-4 w-4" />
        <span>Đơn hàng của tôi</span>
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => navigate("/wishlist")}
        className="cursor-pointer"
      >
        <Heart className="mr-2 h-4 w-4" />
        <span>Yêu thích</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />

      <DropdownMenuItem
        onClick={handleLogout}
        className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
      >
        <LogOut className="mr-2 h-4 w-4" />
        <span>Đăng xuất</span>
      </DropdownMenuItem>
    </>
  );
}

export default UserMenuLinks;

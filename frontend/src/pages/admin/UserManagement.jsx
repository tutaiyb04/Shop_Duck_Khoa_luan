import useUserManagement from "@/hooks/adminHooks/userUserManagement";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertTriangle,
  MoreVertical,
  ShieldCheck,
  Unlock,
  Lock,
} from "lucide-react";

function UserManagement() {
  const { users, isLoading, handleToggleLock } = useUserManagement();

  if (isLoading && users.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        Đang tải dữ liệu người dùng...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-yellow-600">
            Quản lý khách hàng
          </h1>
          <p className="text-xl text-gray-500 mt-5">
            Tổng số:{" "}
            <span className="font-bold text-gray-800">{users.length}</span> tài
            khoản
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full border-collapse text-sm sm:text-base">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 text-left font-semibold text-gray-600 whitespace-nowrap">
                Tài khoản
              </th>
              <th className="p-4 text-left font-semibold text-gray-600 whitespace-nowrap">
                Email
              </th>
              <th className="p-4 text-center font-semibold text-gray-600 whitespace-nowrap">
                Vai trò
              </th>
              <th className="p-4 text-center font-semibold text-gray-600 whitespace-nowrap">
                Bị báo cáo
              </th>
              <th className="p-4 text-center font-semibold text-gray-600 whitespace-nowrap">
                Trạng thái
              </th>
              <th className="p-4 text-center font-semibold text-gray-600 whitespace-nowrap">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isHighRisk = user.reportCount >= 3;

              return (
                <tr
                  key={user._id}
                  className={`border-b border-gray-100 transition-colors ${
                    isHighRisk
                      ? "bg-red-50/50 hover:bg-red-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {/* CỘT 1: Avatar + Tên hiển thị */}
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-gray-200">
                        <AvatarImage
                          src={user.avatar}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-yellow-100 text-yellow-700 font-bold">
                          {user.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-gray-800">
                        {user.username}
                      </span>
                    </div>
                  </td>

                  {/* CỘT 2: Email */}
                  <td className="p-4 text-gray-600 whitespace-nowrap">
                    {user.email}
                  </td>

                  {/* CỘT 3: Vai trò */}
                  <td className="p-4 text-center whitespace-nowrap">
                    {user.role === "admin" ? (
                      <span className="flex items-center justify-center gap-1 text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full w-fit mx-auto">
                        <ShieldCheck size={14} /> Admin
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        Người dùng
                      </span>
                    )}
                  </td>

                  {/* CỘT 4: Số lần bị Report */}
                  <td className="p-4 text-center whitespace-nowrap">
                    {isHighRisk ? (
                      <span className="flex items-center justify-center gap-1 font-bold text-red-600">
                        <AlertTriangle size={16} /> {user.reportCount || 0}
                      </span>
                    ) : (
                      <span className="text-gray-500 font-medium">
                        {user.reportCount || 0}
                      </span>
                    )}
                  </td>

                  {/* CỘT 5: Trạng thái Khóa/Hoạt động */}
                  <td className="p-4 text-center whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 text-[11px] sm:text-xs font-bold rounded-full uppercase tracking-wider ${
                        user.status === "locked"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {user.status === "locked" ? "Bị khóa" : "Hoạt động"}
                    </span>
                  </td>

                  {/* CỘT 6: Hành động (Menu Dropdown) */}
                  <td className="p-4 flex justify-center whitespace-nowrap">
                    {user.role === "admin" ? (
                      <span className="text-gray-400 text-[11px] italic mt-2">
                        Bất khả xâm phạm
                      </span>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:!bg-gray-200 !border-1 !border-gray-200 !ring-0 !outline-none"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {/* Nút Khóa / Mở Khóa */}
                          <DropdownMenuItem
                            onClick={() =>
                              handleToggleLock(user._id, user.status)
                            }
                            className={`cursor-pointer font-medium ${user.status === "locked" ? "text-green-600 focus:text-green-600 focus:bg-green-50" : "text-red-600 focus:text-red-600 focus:bg-red-50"}`}
                          >
                            {user.status === "locked" ? (
                              <>
                                <Unlock className="mr-2 h-4 w-4" /> Mở khóa tài
                                khoản
                              </>
                            ) : (
                              <>
                                <Lock className="mr-2 h-4 w-4" /> Khóa tài khoản
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>
                </tr>
              );
            })}

            {users.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  Không tìm thấy người dùng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;

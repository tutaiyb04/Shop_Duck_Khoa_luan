import UserTable from "@/components/admin/usermanagement/UserTable";
import CustomPagination from "@/components/shared/CustomPagination";
import LoadingBlock from "@/components/shared/LoadingBlock";
import useUserManagement from "@/hooks/adminHooks/userUserManagement";

function UserManagement() {
  const { users, isLoading, pagination, fetchUsers, handleToggleLock } =
    useUserManagement();

  if (isLoading && users.length === 0) {
    return (
      <LoadingBlock message="Đang tải dữ liệu người dùng…" className="p-8 py-12" />
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

      <UserTable users={users} handleToggleLock={handleToggleLock} />

      <CustomPagination
        pagination={pagination}
        onPageChange={(newPage) => fetchUsers(newPage)}
      />
    </div>
  );
}

export default UserManagement;

import UserTableRow from "./UserTableRow";

function UserTable({ users, handleToggleLock }) {
  return (
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
          {users.map((user) => (
            <UserTableRow
              key={user._id}
              user={user}
              handleToggleLock={handleToggleLock}
            />
          ))}

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
  );
}

export default UserTable;

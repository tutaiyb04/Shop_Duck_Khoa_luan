import ReportTableRow from "./ReportTableRow";

function ReportTable({ reports, loading, onResolve }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ngày báo cáo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Đối tượng bị báo cáo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Người báo cáo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Lý do & Mô tả
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td
                colSpan="6"
                className="px-6 py-10 text-center text-sm text-gray-500"
              >
                Đang tải dữ liệu báo cáo...
              </td>
            </tr>
          ) : reports.length === 0 ? (
            <tr>
              <td
                colSpan="6"
                className="px-6 py-10 text-center text-sm text-gray-500 italic"
              >
                Không tìm thấy báo cáo nào phù hợp.
              </td>
            </tr>
          ) : (
            reports.map((report) => (
              <ReportTableRow
                key={report._id}
                report={report}
                onResolve={onResolve}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ReportTable;

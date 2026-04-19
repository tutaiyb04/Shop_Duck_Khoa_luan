import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CheckCircle, XCircle } from "lucide-react";

function ReportTableRow({ report, onResolve }) {
  const getStatusBadge = (status) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-700",
      RESOLVED: "bg-red-100 text-red-700",
      REJECTED: "bg-gray-200 text-gray-700",
    };
    const labels = {
      PENDING: "Chờ duyệt",
      RESOLVED: "Vi phạm",
      REJECTED: "Bỏ qua",
    };

    return (
      <span
        className={`${styles[status] || "bg-gray-100"} px-2.5 py-1 rounded-full text-xs font-bold`}
      >
        {labels[status] || status}
      </span>
    );
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {format(new Date(report.createdAt), "dd/MM/yyyy HH:mm")}
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-semibold text-blue-600 hover:underline cursor-pointer">
          {report.targetType === "Product"
            ? report.targetId?.name
            : report.targetId?.username || "N/A"}
        </div>
        <div className="text-xs text-gray-400 uppercase tracking-tighter">
          {report.targetType}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 font-medium">
          {report.reporterId?.username}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-bold text-red-600 mb-0.5">
          {report.reason}
        </div>
        <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">
          {report.description}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(report.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {report.status === "PENDING" && (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-emerald-600 hover:!bg-emerald-50 hover:text-emerald-700 px-2 !border-1 !border-gray-200 !ring-0 !outline-none"
              onClick={() => onResolve(report._id, "APPROVE")}
            >
              <CheckCircle className="w-4 h-4 mr-1" /> Duyệt
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-gray-500 hover:!bg-gray-50 px-2 !border-1 !border-gray-200 !ring-0 !outline-none"
              onClick={() => onResolve(report._id, "REJECT")}
            >
              <XCircle className="w-4 h-4 mr-1" /> Bỏ qua
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
}

export default ReportTableRow;

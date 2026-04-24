import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Lock, Unlock, XCircle } from "lucide-react";

const StatusBadge = ({ status }) => {
  switch (status) {
    case "PENDING":
      return (
        <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-bold">
          Chờ duyệt
        </span>
      );
    case "AVAILABLE":
      return (
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
          Đang bán
        </span>
      );
    case "REJECTED":
      return (
        <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs font-bold">
          Bị từ chối
        </span>
      );
    case "LOCKED":
      return (
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
          Bị khóa
        </span>
      );
    case "SOLD":
      return (
        <span className="bg-slate-200 text-slate-800 px-2 py-1 rounded-full text-xs font-bold">
          Đã bán
        </span>
      );
    case "HIDDEN":
      return (
        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-bold">
          Đã xóa
        </span>
      );
    default:
      return (
        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-bold">
          {status}
        </span>
      );
  }
};

function ProductTable({ products, loading, handleUpdateStatus }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="p-4 text-left font-semibold text-gray-600 whitespace-nowrap">
              Sản phẩm
            </th>
            <th className="p-4 text-left font-semibold text-gray-600 whitespace-nowrap">
              Người bán
            </th>
            <th className="p-4 text-left font-semibold text-gray-600 whitespace-nowrap">
              Danh mục
            </th>
            <th className="p-4 text-left font-semibold text-gray-600 whitespace-nowrap">
              Giá
            </th>
            <th className="p-4 text-center font-semibold text-gray-600 whitespace-nowrap">
              Trạng thái
            </th>
            <th className="p-4 text-center font-semibold text-gray-600 whitespace-nowrap">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" className="p-8 text-center text-gray-500">
                Đang tải dữ liệu...
              </td>
            </tr>
          ) : products.length === 0 ? (
            <tr>
              <td colSpan="6" className="p-8 text-center text-gray-500">
                Không tìm thấy sản phẩm nào.
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr
                key={product._id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="p-4 flex items-center gap-3 whitespace-nowrap">
                  <img
                    src={product.images[0] || "https://via.placeholder.com/50"}
                    alt={product.name}
                    className="w-12 h-12 rounded object-cover border"
                  />
                  <span className="font-semibold text-gray-800 line-clamp-2 max-w-[200px] whitespace-normal flex flex-wrap items-center gap-1.5">
                    {product.name}
                    {product.isVIP && (
                      <Badge
                        variant="destructive"
                        className="h-5 shrink-0 border-0 bg-amber-500 px-1.5 text-[10px] font-bold uppercase text-white"
                      >
                        HOT
                      </Badge>
                    )}
                  </span>
                </td>
                <td className="p-4 text-gray-600 whitespace-nowrap">
                  {product.sellerId?.username || "Ẩn danh"}
                </td>
                <td className="p-4 text-gray-600 whitespace-nowrap">
                  {product.category?.name || "Khác"}
                </td>
                <td className="p-4 font-medium text-yellow-600 whitespace-nowrap">
                  {product.price.toLocaleString("vi-VN")} đ
                </td>
                <td className="p-4 text-center whitespace-nowrap">
                  <StatusBadge status={product.status} />
                </td>

                {/* NÚT THAO TÁC THEO TRẠNG THÁI */}
                <td className="p-4 whitespace-nowrap">
                  <div className="flex justify-center gap-2">
                    {product.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          className="!bg-green-500 hover:!bg-green-600 text-white px-2 !border-1 !border-gray-200 !ring-0 !outline-none"
                          onClick={() =>
                            handleUpdateStatus(product._id, "AVAILABLE")
                          }
                        >
                          <CheckCircle className="w-4 h-4 mr-1" /> Duyệt
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="!bg-red-500 hover:!bg-red-600 px-2 !border-1 !border-gray-200 !ring-0 !outline-none"
                          onClick={() =>
                            handleUpdateStatus(product._id, "REJECTED")
                          }
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Từ chối
                        </Button>
                      </>
                    )}

                    {product.status === "AVAILABLE" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:!bg-red-50 hover:text-red-700 px-2 !border-1 !border-gray-200 !ring-0 !outline-none"
                        onClick={() =>
                          handleUpdateStatus(product._id, "LOCKED")
                        }
                      >
                        <Lock className="w-4 h-4 mr-1" /> Khóa tin
                      </Button>
                    )}

                    {product.status === "LOCKED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:bg-green-50 hover:text-green-700 px-2"
                        onClick={() =>
                          handleUpdateStatus(product._id, "AVAILABLE")
                        }
                      >
                        <Unlock className="w-4 h-4 mr-1" /> Mở khóa
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProductTable;

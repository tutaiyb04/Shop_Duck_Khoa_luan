import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, CheckCircle, Trash2 } from "lucide-react";

function ManageProductsTable({
  products,
  handleUpdateStatus,
  navigate,
  setVipTarget,
  getStatusInfo,
  shouldShowVipUpgrade,
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sản phẩm</TableHead>
            <TableHead>Giá</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="min-w-[140px]">HOT / VIP</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products?.map((product) => (
            <TableRow key={product._id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <img
                    src={product.images[0]}
                    alt=""
                    className="w-12 h-12 rounded object-cover"
                  />
                  <span className="truncate max-w-[150px] md:max-w-[200px]">
                    {product.name}
                  </span>
                </div>
              </TableCell>
              <TableCell>{product.price.toLocaleString()}đ</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={getStatusInfo(product.status).className}
                >
                  {getStatusInfo(product.status).label}
                </Badge>
              </TableCell>
              <TableCell className="text-sm align-top max-w-[200px]">
                <div className="flex flex-col gap-2">
                  {product.isVIP && (
                    <div className="space-y-0.5">
                      <Badge
                        variant="destructive"
                        className="!bg-amber-500 text-white border-0 w-fit"
                      >
                        HOT
                      </Badge>
                      {product.vipUntil && (
                        <p className="text-[11px] text-gray-500">
                          Hạn:{" "}
                          {new Date(product.vipUntil).toLocaleString("vi-VN")}
                        </p>
                      )}
                    </div>
                  )}
                  {shouldShowVipUpgrade(product) && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setVipTarget(product)}
                      className="!h-8 w-fit text-xs mt-2.5  !bg-yellow-600 hover:!bg-yellow-700  text-white !border-0"
                    >
                      {product.isVIP ? "Gia hạn VIP" : "Mua gói VIP"}
                    </Button>
                  )}
                  {!product.isVIP && !shouldShowVipUpgrade(product) && (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right space-x-2 whitespace-nowrap">
                {product.status !== "SOLD" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="!transition-colors !border-1 !border-gray-200 !bg-gray-200 hover:!bg-gray-300 !ring-0 !outline-none"
                    onClick={() => navigate(`/edit-product/${product._id}`)}
                  >
                    <Edit className="w-4 h-4 mr-1" /> Sửa
                  </Button>
                )}
                {product.status !== "SOLD" && (
                  <Button
                    variant="default"
                    size="sm"
                    className="!transition-colors !border-0 !bg-green-500 hover:!bg-green-600 !ring-0 !outline-none"
                    onClick={() => handleUpdateStatus(product._id, "SOLD")}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" /> Đã bán
                  </Button>
                )}
                {product.status !== "SOLD" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="!transition-colors !border-0 !bg-red-500 hover:!bg-red-600 !ring-0 !outline-none"
                    onClick={() => handleUpdateStatus(product._id, "HIDDEN")}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Xóa tin
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default ManageProductsTable;

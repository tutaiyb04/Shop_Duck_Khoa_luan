import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, CheckCircle, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useMyProducts from "@/hooks/productHooks/useMyProducts";
import UserSidebar from "@/components/shared/UserSidebar";

// Tạo một object để ánh xạ trạng thái sang tiếng Việt
const STATUS_MAP = {
  AVAILABLE: "Đang bán",
  SOLD: "Đã bán",
  HIDDEN: "Đã ẩn", // Dự phòng nếu bạn có trạng thái ẩn
};

function ManageProducts() {
  const { products, loading, handleUpdateStatus } = useMyProducts();
  const navigate = useNavigate();

  if (loading)
    return (
      <div className="text-center mt-20 text-gray-500">
        Đang tải dữ liệu hồ sơ...
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-20 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Sidebar điều hướng */}
        <UserSidebar />

        {/* Khu vực quản lý sản phẩm bọc trong Card */}
        <div className="flex-1 w-full min-w-0">
          <Card className="shadow-sm border-1 bg-white">
            <CardHeader className="border-b mb-6">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                Tất cả sản phẩm đã đăng
              </CardTitle>
              <CardDescription>
                Xem, chỉnh sửa hoặc cập nhật trạng thái các món đồ bạn đang rao
                bán.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Giá</TableHead>
                      <TableHead>Trạng thái</TableHead>
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
                            variant={
                              product.status === "AVAILABLE"
                                ? "success"
                                : "secondary"
                            }
                          >
                            {STATUS_MAP[product.status] || product.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2 whitespace-nowrap">
                          {/* Sửa thông tin */}
                          {product.status !== "SOLD" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="!transition-colors !border-1 !border-gray-200 !bg-gray-200 hover:!bg-gray-300 !ring-0 !outline-none"
                              onClick={() =>
                                navigate(`/edit-product/${product._id}`)
                              }
                            >
                              <Edit className="w-4 h-4 mr-1" /> Sửa
                            </Button>
                          )}

                          {/* Đánh dấu đã bán */}
                          {product.status !== "SOLD" && (
                            <Button
                              variant="default"
                              size="sm"
                              className="!transition-colors !border-0 !bg-green-500 hover:!bg-green-600 !ring-0 !outline-none"
                              onClick={() =>
                                handleUpdateStatus(product._id, "SOLD")
                              }
                            >
                              <CheckCircle className="w-4 h-4 mr-1" /> Đã bán
                            </Button>
                          )}

                          {/* Xóa tin đăng */}
                          {product.status !== "SOLD" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="!transition-colors !border-0 !bg-red-500 hover:!bg-red-600 !ring-0 !outline-none"
                              onClick={() =>
                                handleUpdateStatus(product._id, "HIDDEN")
                              }
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ManageProducts;

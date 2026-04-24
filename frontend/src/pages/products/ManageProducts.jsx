import { useState, useEffect, useContext } from "react";
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
import { Edit, CheckCircle, Trash2, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { API } from "@/services/axios";
import { getSocket } from "@/services/socket";
import { AuthContext } from "@/context/AuthContext";
import useMyProducts from "@/hooks/productHooks/useMyProducts";
import UserSidebar from "@/components/shared/UserSidebar";

/** Nhãn + style badge trạng thái sản phẩm (đủ enum backend) */
const PRODUCT_STATUS = {
  PENDING: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-900 border-amber-200" },
  AVAILABLE: { label: "Đang bán", className: "bg-green-100 text-green-800 border-green-200" },
  REJECTED: { label: "Bị từ chối", className: "bg-gray-200 text-gray-800 border-gray-300" },
  LOCKED: { label: "Bị khóa", className: "bg-red-100 text-red-800 border-red-200" },
  SOLD: { label: "Đã bán", className: "bg-slate-200 text-slate-800 border-slate-300" },
  HIDDEN: { label: "Đã ẩn", className: "bg-gray-100 text-gray-700 border-gray-200" },
};

function getStatusInfo(status) {
  if (status && PRODUCT_STATUS[status]) return PRODUCT_STATUS[status];
  return {
    label: status || "—",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  };
}

/** Gói VIP: chỉ khi còn đang Chờ duyệt hoặc Đang bán (đồng bộ backend) */
function canPayVip(product) {
  if (product.isVIP) return false;
  return product.status === "PENDING" || product.status === "AVAILABLE";
}

function ManageProducts() {
  const { user } = useContext(AuthContext);
  const { products, loading, handleUpdateStatus, refresh } = useMyProducts();
  const navigate = useNavigate();
  const [vipLoadingId, setVipLoadingId] = useState(null);

  const handleBuyVip = async (productId) => {
    setVipLoadingId(productId);
    try {
      const { data } = await API.post("/payment/create-vip-link", {
        productId,
      });
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }
      toast.error("Không nhận được link thanh toán từ PayOS");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không tạo được link (kiểm tra cấu hình PayOS trên server)";
      toast.error(msg);
    } finally {
      setVipLoadingId(null);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vip = params.get("vip_payment");
    if (!vip) return;
    params.delete("vip_payment");
    const next = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${next ? `?${next}` : ""}`,
    );
    if (vip === "success") {
      toast.success(
        "Thanh toán đã ghi nhận. Gói VIP sẽ cập nhật sau vài giây khi PayOS xác nhận.",
      );
      refresh();
    } else {
      toast("Bạn đã hủy thanh toán gói VIP.", { icon: "ℹ️" });
    }
  }, [refresh]);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    if (!socket) return;
    const onVip = () => {
      toast.success("Gói VIP đã kích hoạt cho một sản phẩm!");
      refresh();
    };
    socket.on("payment:vip_success", onVip);
    return () => {
      socket.off("payment:vip_success", onVip);
    };
  }, [user, refresh]);

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
                Xem, chỉnh sửa, thanh toán gói VIP nổi bật hoặc cập nhật trạng
                thái các món đồ bạn đang rao bán.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="mb-4 rounded-lg border border-amber-200/80 bg-amber-50/80 p-3 text-sm text-amber-950">
                <p className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  Gói hiển thị VIP
                </p>
                <p className="mt-1 text-xs sm:text-sm text-amber-900/90 leading-relaxed">
                  Với sản phẩm ở trạng thái <strong>Chờ duyệt</strong> hoặc{" "}
                  <strong>Đang bán</strong>, bạn có thể thanh toán qua PayOS để
                  tin nổi bật trên trang chủ (có nhãn VIP) và{" "}
                  <strong>được ưu tiên hiển thị ở trang quản trị sản phẩm</strong>{" "}
                  của Admin.
                </p>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Giá</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="min-w-[140px]">VIP</TableHead>
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
                        <TableCell className="text-sm align-top">
                          {product.isVIP ? (
                            <div className="space-y-0.5">
                              <Badge
                                variant="destructive"
                                className="!bg-amber-500 text-white border-0"
                              >
                                VIP
                              </Badge>
                              {product.vipUntil && (
                                <p className="text-[11px] text-gray-500 max-w-[11rem]">
                                  Hạn:{" "}
                                  {new Date(
                                    product.vipUntil,
                                  ).toLocaleString("vi-VN")}
                                </p>
                              )}
                            </div>
                          ) : canPayVip(product) ? (
                            <Button
                              type="button"
                              size="sm"
                              disabled={vipLoadingId === product._id}
                              onClick={() => handleBuyVip(product._id)}
                              className="!h-8 text-xs !bg-gradient-to-r !from-red-600 !to-amber-600 hover:!from-red-700 hover:!to-amber-700 text-white !border-0"
                            >
                              {vipLoadingId === product._id ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                                  Đang tạo link…
                                </>
                              ) : (
                                "Thanh toán VIP"
                              )}
                            </Button>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
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

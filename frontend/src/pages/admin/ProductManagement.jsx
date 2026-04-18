import ProductFilter from "@/components/admin/productManagement/ProductFilter";
import ProductTable from "@/components/admin/productManagement/ProductTable";
import useAdminProduct from "@/hooks/adminHooks/useAdminProduct";

function ProductManagement() {
  const { products, loading, filters, setFilters, handleUpdateStatus } =
    useAdminProduct();

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-yellow-600">
          Kiểm duyệt sản phẩm
        </h1>
        <p className="text-xl text-gray-500 mt-5">
          Quản lý tin đăng sản phẩm & kiểm soát nội dung vi phạm
        </p>
      </div>

      <ProductFilter filters={filters} setFilters={setFilters} />

      <ProductTable
        products={products}
        loading={loading}
        handleUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}

export default ProductManagement;

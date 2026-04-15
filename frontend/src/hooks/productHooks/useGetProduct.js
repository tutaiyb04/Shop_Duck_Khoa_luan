import { API } from "@/services/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export function useGetProduct() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);

      const response = await API.get("/products");
      setProducts(response.data.products);
    } catch (error) {
      console.log("Lỗi tải sản phẩm: ", error);
      toast.error("Lỗi khi tải sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, isLoading, refresh: fetchProducts };
}

import { API } from "@/services/axios";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const useEditProduct = (productId) => {
  const [initialData, setInitialData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [productRes, categoryRes] = await Promise.all([
          API.get(`/products/${productId}`),
          API.get("/categories"),
        ]);
        const product = productRes.data.product;
        const fetchedCategories = categoryRes.data.category || categoryRes.data;
        setCategories(fetchedCategories);

        setInitialData({
          title: product.name,
          price: product.price,
          category: product.category?._id || product.category,
          parentCategory:
            product.category?.parentId?._id || product.category?.parentId || "",
          condition: product.condition,
          quantity: product.quantity,
          description: product.description,
          location: product.address,
          attributes: product.attributes || { size: "" },
          lat: product.location?.coordinates[1] || "",
          lng: product.location?.coordinates[0] || "",
          existingImages: product.images,
        });
      } catch (error) {
        console.log("Lỗi khi hiện thông tin sản phẩm: ", error);
        toast.error("Không tìm thấy thông tin sản phẩm");
        navigate("/my-products");
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId, navigate]);

  console.log("initialData", initialData);

  const handleUpdate = async (formData) => {
    try {
      setIsUpdating(true);
      await API.put(`/products/${productId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Cập nhật sản phẩm thành công!");
      navigate("/my-products");
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setIsUpdating(false);
    }
  };

  return { initialData, categories, loading, isUpdating, handleUpdate };
};

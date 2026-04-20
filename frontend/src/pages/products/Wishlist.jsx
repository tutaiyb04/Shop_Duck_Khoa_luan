import { useEffect, useState } from "react";
import { API } from "@/services/axios";
import { Heart } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";

function Wishlist() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await API.get("/user/wishlist");
        setList(res.data.wishlist);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  if (loading) return <div className="p-10 text-center">Đang tải...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        Sản phẩm bạn đã yêu thích
      </h1>

      {list.length === 0 ? (
        <div className="bg-white p-10 rounded-xl border text-center text-gray-500">
          Bạn chưa có sản phẩm yêu thích nào.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {list.map((item) => (
            <ProductCard key={item._id} product={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;

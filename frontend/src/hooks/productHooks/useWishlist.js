import { API } from "@/services/axios";
import { useEffect, useState } from "react";

function useWishlist() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredList = list.filter((item) =>
    item?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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

  return {
    list,
    loading,
    filteredList,
    searchTerm,
    setSearchTerm,
  };
}

export default useWishlist;

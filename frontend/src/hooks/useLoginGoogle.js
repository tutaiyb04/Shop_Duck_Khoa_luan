import { API } from "@/services/axios";
import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function useLoginGoogle() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSuccess = async (result) => {
    try {
      // Lấy mã token từ kết quả Google trả về
      const payload = {
        token: result.access_token,
      };

      const response = await API.post("/user/google-login", payload);

      toast.success("Đăng nhập Google thành công!");

      login(response.data);
      navigate("/");
    } catch (error) {
      console.log("Lỗi đăng nhập Google: ", error);
      toast.error("Đăng nhập thất bại!");
    }
  };

  return { onSuccess };
}

export default useLoginGoogle;

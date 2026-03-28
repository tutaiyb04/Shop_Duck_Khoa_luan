import { API } from "@/services/axios";
import { AuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import toast from "react-hot-toast";

function useLoginFacebook() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSuccess = async (response) => {
    try {
      const payload = {
        token: response.accessToken,
      };

      const res = await API.post("user/facebook-login", payload);

      login(res.data);
      navigate("/");

      toast.success("Đăng nhập Facebook thành công");
    } catch (error) {
      console.log("Lỗi đăng nhập Facebook: ", error);
      toast.error("Đăng nhập thất bại!");
    }
  };

  return { onSuccess };
}

export default useLoginFacebook;

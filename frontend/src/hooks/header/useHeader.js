import { AuthContext } from "@/context/AuthContext";
import {
  useContext,
  useEffect,
  useRef,
  useState,
  startTransition,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function useHeader() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState(null);
  const [radius, setRadius] = useState("5000"); // chuỗi mét bán kính tìm kiếm (5 / 10 / 20 km)
  const [isLocating, setIsLocating] = useState(false);
  const [searchPanelOpen, setSearchPanelOpen] = useState(false); // trạng thái mở/đóng panel tìm kiếm
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const geoRequestGen = useRef(0); // số lần request lấy vị trí GPS - callback cũ ko ghi đè state khi user hủy / bấm lại nhanh
  const searchContainerRef = useRef(null); // DOM ô search — dùng để biết click có ra ngoài panel không (đóng panel) -> cần cleanup khi unmount

  const qSearch = searchParams.get("search") ?? "";
  const qLat = searchParams.get("lat") ?? ""; // vĩ độ từ URL
  const qLng = searchParams.get("lng") ?? ""; // kinh độ từ URL
  const qRadius = searchParams.get("radius") ?? "5000"; // bán kính tìm kiếm từ URL

  // Đồng bộ ô tìm kiếm + bộ lọc vị trí với URL
  useEffect(() => {
    startTransition(() => {
      setSearchQuery(qSearch);

      // đồng bộ vị trí từ URL
      if (qLat && qLng) {
        const latNum = parseFloat(qLat);
        const lngNum = parseFloat(qLng);

        // nếu vĩ độ và kinh độ hợp lệ thì đồng bộ vị trí
        if (Number.isFinite(latNum) && Number.isFinite(lngNum)) {
          setLocation({ lat: latNum, lng: lngNum }); // nút MapPin / dropdown bán kính hiển thị đúng “đang bật vị trí
        } else {
          setLocation(null);
        }
      } else {
        setLocation(null);
      }

      // đồng bộ bán kính từ URL
      setRadius(qRadius || "5000");
    });
  }, [qSearch, qLat, qLng, qRadius]);

  // xử lý khi đóng panel tìm kiếm
  useEffect(() => {
    if (!searchPanelOpen) return undefined;

    // xử lý khi click ngoài panel tìm kiếm
    const onPointerDown = (e) => {
      // nếu click ngoài panel tìm kiếm thì đóng panel
      if (!searchContainerRef.current?.contains(e.target)) {
        setSearchPanelOpen(false);
      }
    };

    const onKey = (e) => {
      if (e.key === "Escape") setSearchPanelOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [searchPanelOpen]);

  // Hàm xử lý xin quyền lấy tọa độ GPS
  const handleGetLocation = () => {
    // đang chờ lấy vị trí
    if (isLocating) {
      geoRequestGen.current += 1; // tăng số lần request
      setIsLocating(false);
      return;
    }
    
    // đã bật vị trí
    if (location) {
      setLocation(null); // tắt vị trí
      geoRequestGen.current += 1; // tăng số lần request
      return;
    }

    if (!("geolocation" in navigator)) {
      alert("Trình duyệt của bạn không hỗ trợ tính năng định vị."); // báo lỗi nếu trình duyệt không hỗ trợ tính năng định vị
      return;
    }

    // gắn mã phiên cho lần xin vị trí
    const myGen = (geoRequestGen.current += 1);
    setIsLocating(true);

    const geoOptions = {
      enableHighAccuracy: false, // tắt chính xác cao - ưu tiên nhanh/tiết kiệm pin hơn là độ chính xác tối đa
      maximumAge: 5 * 60 * 1000, // được phép dùng vị trí tối đa 5 phút
      timeout: 25_000, // thời gian chờ tối đa 25 giây
    };

    navigator.geolocation.getCurrentPosition(
      // khi lấy vị trí thành công
      (position) => {
        if (myGen !== geoRequestGen.current) return; // lần xin vị trí này ko còn là phiên hiện tại -> ko cập nhật state -> tránh ghi đè nhầm
        
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });

        setIsLocating(false);
      },
      // khi lấy vị trí thất bại
      (error) => {
        if (myGen !== geoRequestGen.current) return;
        console.error("Lỗi lấy vị trí: ", error);
        alert(
          "Vui lòng cấp quyền truy cập vị trí trên trình duyệt để tìm đồ gần bạn!",
        );
        setIsLocating(false);
      },
      geoOptions,
    );
  };

  // Hàm xử lý Tìm kiếm
  const handleSearch = (e) => {
    if (e) e.preventDefault();

    if (!searchQuery.trim() && !location) {
      navigate("/");
      setSearchPanelOpen(false);
      return;
    }

    // dựng chuỗi query chuẩn cho URL
    const queryParams = new URLSearchParams();

    if (searchQuery.trim()) queryParams.append("search", searchQuery.trim());
    
    if (location) {
      queryParams.append("lat", location.lat);
      queryParams.append("lng", location.lng);
      queryParams.append("radius", radius);
    }

    navigate(`/?${queryParams.toString()}`);
    setSearchPanelOpen(false);
  };

  // Hàm Đăng xuất
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return {
    user,
    navigate,
    searchQuery,
    setSearchQuery,
    location,
    radius,
    setRadius,
    isLocating,
    handleGetLocation,
    handleSearch,
    handleLogout,
    searchContainerRef,
    searchPanelOpen,
    setSearchPanelOpen,
    mobileNavOpen,
    setMobileNavOpen,
  };
}

export default useHeader;

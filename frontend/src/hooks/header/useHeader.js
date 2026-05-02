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
  const [radius, setRadius] = useState("5000");
  const [isLocating, setIsLocating] = useState(false);
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const geoRequestGen = useRef(0);
  const searchContainerRef = useRef(null);

  const qSearch = searchParams.get("search") ?? "";
  const qLat = searchParams.get("lat") ?? "";
  const qLng = searchParams.get("lng") ?? "";
  const qRadius = searchParams.get("radius") ?? "5000";

  // Đồng bộ ô tìm kiếm + bộ lọc vị trí với URL
  useEffect(() => {
    startTransition(() => {
      setSearchQuery(qSearch);
      if (qLat && qLng) {
        const latNum = parseFloat(qLat);
        const lngNum = parseFloat(qLng);
        if (Number.isFinite(latNum) && Number.isFinite(lngNum)) {
          setLocation({ lat: latNum, lng: lngNum });
        } else {
          setLocation(null);
        }
      } else {
        setLocation(null);
      }
      setRadius(qRadius || "5000");
    });
  }, [qSearch, qLat, qLng, qRadius]);

  // xử lý khi đóng panel tìm kiếm
  useEffect(() => {
    if (!searchPanelOpen) return undefined;

    const onPointerDown = (e) => {
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
    if (isLocating) {
      geoRequestGen.current += 1;
      setIsLocating(false);
      return;
    }
    if (location) {
      setLocation(null);
      geoRequestGen.current += 1;
      return;
    }

    if (!("geolocation" in navigator)) {
      alert("Trình duyệt của bạn không hỗ trợ tính năng định vị.");
      return;
    }

    const myGen = (geoRequestGen.current += 1);
    setIsLocating(true);
    const geoOptions = {
      enableHighAccuracy: false,
      maximumAge: 5 * 60 * 1000,
      timeout: 25_000,
    };
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (myGen !== geoRequestGen.current) return;
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
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

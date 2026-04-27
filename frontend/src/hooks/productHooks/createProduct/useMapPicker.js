import { useEffect, useRef, useState } from "react";

function useMapPicker({ onLocationSelect, searchAddress }) {
  const [markerPos, setMarkerPos] = useState(null);
  const [map, setMap] = useState(null); // Lưu thực thể bản đồ
  const timeoutRef = useRef(null);
  const defaultCenter = [21.0285, 105.8542];

  // Xử lý sự kiện Click trên bản đồ
  useEffect(() => {
    if (!map) return;

    const handleMapClick = async (e) => {
      const { lat, lng } = e.latlng;
      setMarkerPos({ lat, lng });

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        );
        const data = await response.json();
        onLocationSelect({
          address: data.display_name,
          lat,
          lng,
        }); // Trả dữ liệu về Form
      } catch (error) {
        console.error("Lỗi lấy địa chỉ:", error);
      }
    };

    map.on("click", handleMapClick);
    return () => map.off("click", handleMapClick); // Cleanup sự kiện
  }, [map, onLocationSelect]);

  //  Xử lý tìm kiếm từ ô nhập liệu
  useEffect(() => {
    if (!searchAddress || searchAddress.length < 5 || !map) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=1`,
        );
        const data = await response.json();

        if (data && data.length > 0) {
          const newLat = parseFloat(data[0].lat);
          const newLon = parseFloat(data[0].lon);

          setMarkerPos({ lat: newLat, lng: newLon });
          map.setView([newLat, newLon], map.getZoom()); // Di chuyển bản đồ

          onLocationSelect({
            address: searchAddress,
            lat: newLat,
            lng: newLon,
            isManual: true,
          }); // Đồng bộ tọa độ vào hook
        }
      } catch (error) {
        console.error("Lỗi tìm kiếm địa chỉ:", error);
      }
    }, 1000);

    return () => clearTimeout(timeoutRef.current);
  }, [searchAddress, map, onLocationSelect]);
  return {
    markerPos,
    defaultCenter,
    setMap,
  };
}

export default useMapPicker;

import React from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import useMapPicker from "@/hooks/productHooks/createProduct/useMapPicker";
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function Mappicker({ onLocationSelect, searchAddress }) {
  const { markerPos, setMap, defaultCenter } = useMapPicker({
    onLocationSelect,
    searchAddress,
  });

  return (
    <div className="h-[350px] w-full rounded-lg overflow-hidden border border-gray-200 z-0">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        ref={setMap} // Lấy thực thể map khi component mount
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {markerPos && <Marker position={[markerPos.lat, markerPos.lng]} />}
      </MapContainer>
    </div>
  );
}

export default React.memo(Mappicker);

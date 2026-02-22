"use client";

import dynamic from "next/dynamic";
import type { LatLngExpression } from "leaflet";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then((m) => m.CircleMarker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

export type RegionalClaimPoint = {
  region: string;
  count: number;
  lat: number;
  lng: number;
};

export function RegionalClaimsMap({ points }: { points: RegionalClaimPoint[] }) {
  const center: LatLngExpression = [20.5937, 78.9629];

  return (
    <div className="h-72 w-full overflow-hidden rounded-xl border border-slate-200 text-slate-900">
      <MapContainer center={center} zoom={5} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((p) => (
          <CircleMarker
            key={p.region}
            center={[p.lat, p.lng] as LatLngExpression}
            radius={Math.min(24, 6 + p.count * 2)}
            pathOptions={{ color: "currentColor", fillColor: "currentColor", fillOpacity: 0.25 }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{p.region}</div>
                <div>{p.count} claims</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

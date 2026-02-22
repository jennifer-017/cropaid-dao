export const regionCoordinates: Record<string, { lat: number; lng: number }> = {
  "Tamil Nadu": { lat: 11.1271, lng: 78.6569 },
  "Karnataka": { lat: 15.3173, lng: 75.7139 },
  "Telangana": { lat: 18.1124, lng: 79.0193 },
  "Andhra Pradesh": { lat: 15.9129, lng: 79.74 },
  "Kerala": { lat: 10.8505, lng: 76.2711 },
  "Maharashtra": { lat: 19.7515, lng: 75.7139 },
  "Gujarat": { lat: 22.2587, lng: 71.1924 },
  "Punjab": { lat: 31.1471, lng: 75.3412 },
};

export function coordsForRegion(region: string) {
  return regionCoordinates[region] ?? { lat: 20.5937, lng: 78.9629 };
}

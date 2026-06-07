function toRad(deg: number) { return deg * Math.PI / 180; }

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&accept-language=fr`;
    const res = await fetch(url, { headers: { 'User-Agent': 'AmbassadeurVTC/1.0 contact@ambassadeur-vtc.fr' } });
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

export interface RouteInfo {
  distanceKm: number;
  durationMin: number;
  originCoords: { lat: number; lng: number } | null;
  destCoords: { lat: number; lng: number } | null;
}

export async function getRouteInfo(origin: string, destination: string, googleMapsKey?: string): Promise<RouteInfo> {
  if (googleMapsKey) {
    try {
      const url =
        `https://maps.googleapis.com/maps/api/directions/json` +
        `?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${googleMapsKey}&language=fr`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes?.length > 0) {
        const leg = data.routes[0].legs[0];
        return {
          distanceKm: Math.round((leg.distance.value / 1000) * 10) / 10,
          durationMin: Math.ceil(leg.duration.value / 60),
          originCoords: { lat: leg.start_location.lat, lng: leg.start_location.lng },
          destCoords: { lat: leg.end_location.lat, lng: leg.end_location.lng },
        };
      }
    } catch {}
  }

  // Fallback: Nominatim + Haversine
  const [originCoords, destCoords] = await Promise.all([
    geocodeAddress(origin),
    geocodeAddress(destination),
  ]);

  if (!originCoords || !destCoords) {
    return { distanceKm: 0, durationMin: 0, originCoords: null, destCoords: null };
  }

  const straightLine = haversineDistance(
    originCoords.lat, originCoords.lng,
    destCoords.lat, destCoords.lng,
  );
  const distanceKm = Math.round(straightLine * 1.3 * 10) / 10; // road factor 1.3
  const durationMin = Math.ceil((distanceKm / 70) * 60); // 70 km/h average

  return { distanceKm, durationMin, originCoords, destCoords };
}

export function calculatePrice(
  distanceKm: number,
  rideType: string,
  settings: { pricing_per_km: number; pricing_min: number; pricing_round_trip_discount: number; pricing_disposal_hourly: number },
  disposalHours = 4
): number {
  if (distanceKm === 0) return 0;
  const base = Math.max(distanceKm * settings.pricing_per_km, settings.pricing_min);
  switch (rideType) {
    case 'round_trip':
      return Math.round(base * 2 * (1 - settings.pricing_round_trip_discount / 100) * 100) / 100;
    case 'disposal':
      return Math.round(settings.pricing_disposal_hourly * disposalHours * 100) / 100;
    default:
      return Math.round(base * 100) / 100;
  }
}
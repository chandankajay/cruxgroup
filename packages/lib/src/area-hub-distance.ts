import { calculateDistanceKm, type LatLng } from "./geo";
import { getClustersData, getHomeBaseHub } from "./clusters";

/** C1 Fathimapur (Kothur) hub — canonical service base (WGS84). */
export const FATHIMAPUR_C1_HUB: LatLng = {
  lat: 17.16672,
  lng: 78.27859,
};

export const HOME_BASE_AREA_SLUG = "fatimapur-kothur";

export function roundStraightLineKm(km: number): number {
  return Math.round(km * 10) / 10;
}

/**
 * Crow-flies distance from the C1 Fathimapur hub to another hub, rounded to 0.1 km.
 */
export function straightLineKmFromC1Hub(areaHub: LatLng): number {
  const c1 = getHomeBaseHub().hub.coordinates;
  const fromC1: LatLng = { lat: c1.lat, lng: c1.lng };
  if (
    Math.abs(fromC1.lat - FATHIMAPUR_C1_HUB.lat) > 1e-5 ||
    Math.abs(fromC1.lng - FATHIMAPUR_C1_HUB.lng) > 1e-5
  ) {
    throw new Error(
      "clusters-data.json C1 hub must match FATHIMAPUR_C1_HUB coordinates",
    );
  }
  return roundStraightLineKm(calculateDistanceKm(FATHIMAPUR_C1_HUB, areaHub));
}

export function straightLineKmForClusterId(clusterId: string): number {
  const cluster = getClustersData().clusters.find((c) => c.id === clusterId);
  if (!cluster) {
    throw new Error(`Unknown cluster id: ${clusterId}`);
  }
  return straightLineKmFromC1Hub(cluster.hub.coordinates);
}

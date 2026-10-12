// Intended repo path: packages/lib/src/clusters.types.ts (export from packages/lib/src/index.ts)
// Data: apps/web/lib/seo/data/clusters-data.json (or packages/lib/src/data/clusters-data.json)
import type { LatLng } from "./geo";

/** verified = India Post PIN; verified_ambiguous = PO PIN found but village name also matches another place (confirm);
 *  unverified = no confirmed PIN (pincode is null; see pincodeHint). */
export type PincodeStatus = "verified" | "verified_ambiguous" | "unverified";

export interface ClusterHub {
  name: string;
  coordinates: LatLng;
  coordinateSource: string;
}

export interface ServiceCluster {
  id: string; // "C1".."C13"
  slug: string;
  displayName: string;
  hub: ClusterHub;
  /** Crow-flies radius from hub, same semantics as Partner.maxServiceRadiusKm */
  maxServiceRadiusKm: number;
  priority: 1 | 2 | 3;
  priorityLabel: string;
  isHomeBase: boolean;
  isFirstBatch: boolean;
  whyHere: string;
  verifiedPincodes: string[];
  villageCount: number;
  verifiedPincodeVillageCount: number;
}

export interface ClusterVillage {
  id: string;
  clusterId: ServiceCluster["id"];
  name: string;
  placeType: string;
  mandal: string;
  mandalSource: string;
  district: string;
  /** Only set when pincodeStatus !== "unverified". Never a guess. */
  pincode: string | null;
  pincodeStatus: PincodeStatus;
  postOffice: string | null;
  /** Nearest-PO guess for unverified villages. NOT verified. */
  pincodeHint: string | null;
  pincodeNote: string | null;
  coordinates: LatLng;
  coordinateSource: string;
  /** Haversine km from hub (cf. calculateDistanceKm) */
  distanceFromHubKm: number;
  /** OSRM road km from hub */
  roadDistanceFromHubKm: number;
  roadFlag: string | null;
  alsoWithinRadiusOf: string | null;
}

export interface ClustersData {
  version: number;
  generatedAt: string;
  homeBaseClusterId: ServiceCluster["id"];
  coordinateSystem: "WGS84";
  notes: string;
  clusters: ServiceCluster[];
  villages: ClusterVillage[];
}

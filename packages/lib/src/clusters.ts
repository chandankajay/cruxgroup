import type { ClustersData, ClusterVillage, ServiceCluster } from "./clusters.types";
import clustersJson from "./data/clusters-data.json";

const data = clustersJson as ClustersData;

export function getClustersData(): ClustersData {
  return data;
}

export function getHomeBaseHub(): ServiceCluster {
  const base = data.clusters.find((c) => c.isHomeBase);
  if (!base) {
    throw new Error("Home base cluster missing from clusters-data.json");
  }
  return base;
}

export function getClusterVillages(clusterId?: string): ClusterVillage[] {
  if (!clusterId) return data.villages;
  return data.villages.filter((v) => v.clusterId === clusterId);
}

export function findVillageById(villageId: string): ClusterVillage | undefined {
  return data.villages.find((v) => v.id === villageId);
}

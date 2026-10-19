import { describe, expect, it } from "vitest";
import { getClustersData } from "./clusters";
import { straightLineKmForClusterId } from "./area-hub-distance";

describe("straightLineKmFromC1Hub (cluster hubs)", () => {
  const data = getClustersData();

  it("has C1 at the Fathimapur coordinates", () => {
    const c1 = data.clusters.find((c) => c.id === "C1");
    expect(c1?.hub.coordinates).toEqual({ lat: 17.16672, lng: 78.27859 });
  });

  it("C1 home base is 0 km straight-line from C1", () => {
    expect(straightLineKmForClusterId("C1")).toBe(0);
  });

  it("C2 Shamshabad is about 16.1 km straight-line from C1", () => {
    const km = straightLineKmForClusterId("C2");
    expect(km).toBeGreaterThan(15.5);
    expect(km).toBeLessThan(16.7);
    expect(Math.abs(km - 16.1)).toBeLessThanOrEqual(0.1);
  });

  it("C5 Shadnagar is about 13.6 km straight-line from C1", () => {
    const km = straightLineKmForClusterId("C5");
    expect(km).toBeGreaterThan(13);
    expect(km).toBeLessThan(14.2);
    expect(Math.abs(km - 13.6)).toBeLessThanOrEqual(0.1);
  });
});

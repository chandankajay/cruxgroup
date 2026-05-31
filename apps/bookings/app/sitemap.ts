import { createCaller, type EquipmentListOutput } from "@repo/api";
import type { MetadataRoute } from "next";

const BASE_URL =
  process.env["NEXT_PUBLIC_BOOKINGS_URL"] ?? "https://bookings.cruxgroup.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const caller = createCaller({});

  let equipment: EquipmentListOutput = [];
  try {
    equipment = await caller.equipment.list();
  } catch {
    equipment = [];
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/dashboard`,
      lastModified: new Date(),
    },
  ];

  const equipmentRoutes: MetadataRoute.Sitemap = equipment.map((item) => ({
    url: `${BASE_URL}/equipment/${item.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...equipmentRoutes];
}

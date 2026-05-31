import type { MetadataRoute } from "next";

const BASE_URL = "https://www.cruxgroup.in";

const ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: NonNullable<
    MetadataRoute.Sitemap[number]["changeFrequency"]
  >;
}> = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
  { path: "/services", priority: 0.9, changeFrequency: "weekly" },
  { path: "/services/jcb", priority: 0.9, changeFrequency: "weekly" },
  { path: "/services/excavator", priority: 0.9, changeFrequency: "weekly" },
  { path: "/services/crane", priority: 0.9, changeFrequency: "weekly" },
  {
    path: "/services/post-hole-digger",
    priority: 0.9,
    changeFrequency: "weekly",
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: path === "/" ? `${BASE_URL}/` : `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}

import { shouldNoIndex } from "@repo/env";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

const BASE_URL = "https://www.cruxgroup.in";

export default function robots(): MetadataRoute.Robots {
  if (shouldNoIndex()) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "Googlebot", allow: "/" },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
    ],
    sitemap: [
      `${BASE_URL}/sitemap.xml`,
      `${BASE_URL}/en/sitemap.xml`,
      `${BASE_URL}/te/sitemap.xml`,
    ],
  };
}

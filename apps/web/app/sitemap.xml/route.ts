const BASE_URL = "https://www.cruxgroup.in";

const SITEMAP_INDEX = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/en/sitemap.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/te/sitemap.xml</loc>
  </sitemap>
</sitemapindex>`;

export function GET(): Response {
  return new Response(SITEMAP_INDEX, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

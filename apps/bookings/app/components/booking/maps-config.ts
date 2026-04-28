export type MapsProvider = "osm" | "google";

/**
 * Runtime map stack selection (no code edits to swap providers).
 *
 * **CTO / CFO**
 * - **`osm` (default):** Leaflet + OpenStreetMap raster tiles + public Nominatim search/reverse.
 *   Cost ~**$0** for development/testing; respect OSM/Nominatim [usage policies](https://operations.osmfoundation.org/policies/nominatim/)
 *   (cache, throttle, identify app via User-Agent — implemented in `nominatim-client.ts`).
 *   For high-volume production, host your own Nominatim or use a commercial geocoder.
 * - **`google`:** Existing Maps JavaScript API + Places Autocomplete + Geocoder — bill per Google Maps Platform pricing when launching production.
 *
 * Set `NEXT_PUBLIC_MAPS_PROVIDER=google` and `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` for production launch.
 */
export function getMapsProvider(): MapsProvider {
  const raw = process.env.NEXT_PUBLIC_MAPS_PROVIDER?.trim().toLowerCase();
  if (raw === "google") return "google";
  return "osm";
}

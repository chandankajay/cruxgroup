const USER_AGENT =
  "CruxBookings/1.0 (site-address-picker; +https://cruxgroup.in; dev/testing OSM stack)";

function headers(): HeadersInit {
  return {
    Accept: "application/json",
    "Accept-Language": "en",
    "User-Agent": USER_AGENT,
  };
}

export type NominatimSearchHit = {
  lat: number;
  lng: number;
  displayName: string;
  pincode?: string;
};

function parseHit(raw: {
  lat?: string;
  lon?: string;
  display_name?: string;
  address?: { postcode?: string };
}): NominatimSearchHit | null {
  const lat = Number(raw.lat);
  const lng = Number(raw.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const displayName = raw.display_name?.trim() ?? "";
  const pc = raw.address?.postcode?.trim();
  return {
    lat,
    lng,
    displayName,
    ...(pc ? { pincode: pc } : {}),
  };
}

/** Forward geocode — typeahead / search box (India-biased). */
export async function nominatimSearch(
  query: string,
  signal?: AbortSignal
): Promise<NominatimSearchHit[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const url =
    `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1` +
    `&limit=6&countrycodes=in&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: headers(), signal });
  if (!res.ok) throw new Error(`Nominatim search failed (${res.status})`);
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) return [];
  const out: NominatimSearchHit[] = [];
  for (const row of data) {
    const hit = parseHit(row as Parameters<typeof parseHit>[0]);
    if (hit) out.push(hit);
  }
  return out;
}

/** Reverse geocode — marker drag / locate me. */
export async function nominatimReverse(
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<{ displayName: string; pincode?: string }> {
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1` +
    `&lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lng))}`;
  const res = await fetch(url, { headers: headers(), signal });
  if (!res.ok) throw new Error(`Nominatim reverse failed (${res.status})`);
  const data = (await res.json()) as {
    display_name?: string;
    address?: { postcode?: string };
  };
  const displayName = data.display_name?.trim() ?? "";
  const pc = data.address?.postcode?.trim();
  return {
    displayName,
    ...(pc ? { pincode: pc } : {}),
  };
}

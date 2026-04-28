"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Loader2 } from "lucide-react";
import { INDIA_CENTER } from "./geo-defaults";
import {
  nominatimReverse,
  nominatimSearch,
  type NominatimSearchHit,
} from "./nominatim-client";
import type { SiteAddressPickerProps } from "./site-address-picker-types";

const LeafletSiteMap = dynamic(
  () =>
    import("./leaflet-site-map").then((m) => m.LeafletSiteMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[200px] w-full animate-pulse rounded-lg border border-border bg-muted"
        aria-hidden
      />
    ),
  }
);

const INPUT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Dev/testing stack: Leaflet + OSM tiles + public Nominatim ($0 — respect usage policy).
 * Toggle via `NEXT_PUBLIC_MAPS_PROVIDER` / see `maps-config.ts`.
 */
export function SiteAddressPickerOsm({
  address,
  onAddressChange,
  onLocationChange,
  onPincodeChange,
  placeholder,
}: SiteAddressPickerProps) {
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number }>(() => ({
    ...INDIA_CENTER,
  }));
  const [searchHits, setSearchHits] = useState<NominatimSearchHit[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchBusy, setSearchBusy] = useState(false);
  const abortSearch = useRef<AbortController | null>(null);
  const abortReverse = useRef<AbortController | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const applyCoords = useCallback(
    (lat: number, lng: number, formatted?: string, pincode?: string) => {
      setMarkerPos({ lat, lng });
      onLocationChange?.({ lat, lng });
      if (formatted) onAddressChange(formatted);
      if (pincode) onPincodeChange?.(pincode);
    },
    [onAddressChange, onLocationChange, onPincodeChange]
  );

  const reverseAt = useCallback(
    async (lat: number, lng: number) => {
      abortReverse.current?.abort();
      const ac = new AbortController();
      abortReverse.current = ac;
      try {
        const { displayName, pincode } = await nominatimReverse(lat, lng, ac.signal);
        const formatted =
          displayName.trim() || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        applyCoords(lat, lng, formatted, pincode);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        applyCoords(lat, lng, `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    },
    [applyCoords]
  );

  useEffect(() => {
    const q = address.trim();
    if (q.length < 3) {
      setSearchHits([]);
      setSearchOpen(false);
      return;
    }
    const timer = setTimeout(() => {
      abortSearch.current?.abort();
      const ac = new AbortController();
      abortSearch.current = ac;
      setSearchBusy(true);
      void nominatimSearch(q, ac.signal)
        .then((hits) => {
          setSearchHits(hits);
          setSearchOpen(hits.length > 0);
        })
        .catch((e) => {
          if ((e as Error).name !== "AbortError") {
            setSearchHits([]);
            setSearchOpen(false);
          }
        })
        .finally(() => setSearchBusy(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [address]);

  useEffect(() => {
    if (!address.trim()) {
      setMarkerPos({ ...INDIA_CENTER });
    }
  }, [address]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const onPickHit = useCallback(
    (hit: NominatimSearchHit) => {
      applyCoords(hit.lat, hit.lng, hit.displayName, hit.pincode);
      setSearchOpen(false);
      setSearchHits([]);
    },
    [applyCoords]
  );

  const onLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void reverseAt(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        /* denied */
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 }
    );
  }, [reverseAt]);

  return (
    <div ref={wrapRef} className="relative space-y-2">
      <div className="relative">
        <input
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          onFocus={() => searchHits.length > 0 && setSearchOpen(true)}
          placeholder={placeholder ?? "Search site address…"}
          className={INPUT_CLASS}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={searchOpen}
        />
        {searchBusy ? (
          <Loader2
            className="pointer-events-none absolute right-3 top-2.5 size-4 animate-spin text-muted-foreground"
            aria-hidden
          />
        ) : null}
        {searchOpen && searchHits.length > 0 ? (
          <ul
            className="absolute z-[600] mt-1 max-h-52 w-full overflow-auto rounded-md border border-border bg-background py-1 text-sm shadow-md"
            role="listbox"
          >
            {searchHits.map((hit, i) => (
              <li key={`${hit.lat}-${hit.lng}-${i}`}>
                <button
                  type="button"
                  role="option"
                  className="w-full px-3 py-2 text-left hover:bg-accent"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onPickHit(hit)}
                >
                  <span className="line-clamp-2 text-foreground">{hit.displayName}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onLocate}
        className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100 active:bg-amber-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
        Locate Me
      </button>

      <div className="overflow-hidden rounded-lg border border-border shadow-sm">
        <LeafletSiteMap
          center={[markerPos.lat, markerPos.lng]}
          onMarkerDragEnd={(la, ln) => void reverseAt(la, ln)}
          onMapClick={(la, ln) => void reverseAt(la, ln)}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Drag the pin or tap the map. Powered by OpenStreetMap and Nominatim (no Google billing).
      </p>
    </div>
  );
}

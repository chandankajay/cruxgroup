"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Crosshair, Loader2, MapPin } from "lucide-react";
import { Button } from "@repo/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { DEFAULT_INDIA_CENTER } from "./geo-defaults";
import type { LeafletLocationMapProps } from "./location-picker-leaflet";

const LeafletLocationMap = dynamic(
  () =>
    import("./location-picker-leaflet").then((m) => m.LeafletLocationMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-[280px] w-full items-center justify-center rounded-lg border border-border bg-muted/40 text-sm text-muted-foreground"
        aria-hidden
      >
        Loading map…
      </div>
    ),
  }
);

/** Public contract — keep stable if swapping Leaflet for Google Places later. */
export type LocationPickerValue = {
  lat: number;
  lng: number;
  address: string;
  pincode?: string;
};

export type LocationPickerProps = {
  /** Initial pin — lat/lng only (avoid passing form `siteAddress` here every keystroke). */
  readonly defaultValue?: Partial<{ lat: number; lng: number }> | null;
  /** Optional label when opening with a known address (walk-in URL prefill) — skips redundant reverse geocode. */
  readonly prefillAddress?: string | null;
  readonly onChange: (value: LocationPickerValue) => void;
  readonly className?: string;
  readonly disabled?: boolean;
};

const NOMINATIM_REVERSE =
  "https://nominatim.openstreetmap.org/reverse?format=json";

function nominatimHeaders(): HeadersInit {
  return {
    Accept: "application/json",
    "Accept-Language": "en",
    "User-Agent":
      "CruxPartnerOS-Admin/1.0 (LocationPicker; contact: https://cruxgroup.in)",
  };
}

async function reverseGeocode(
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<{ displayName: string; pincode?: string }> {
  const url = `${NOMINATIM_REVERSE}&lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lng))}`;
  const res = await fetch(url, { headers: nominatimHeaders(), signal });
  if (!res.ok) throw new Error(`Geocoder returned ${res.status}`);
  const data = (await res.json()) as {
    display_name?: string;
    address?: { postcode?: string };
  };
  const displayName = data.display_name?.trim() ?? "";
  const pincode = data.address?.postcode?.trim();
  return {
    displayName,
    pincode: pincode && pincode.length > 0 ? pincode : undefined,
  };
}

export function LocationPicker({
  defaultValue,
  prefillAddress,
  onChange,
  className,
  disabled,
}: LocationPickerProps) {
  const abortRef = useRef<AbortController | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reversePrefetchSig = useRef<string | null>(null);

  const initial = useMemo(() => {
    const lat = defaultValue?.lat;
    const lng = defaultValue?.lng;
    if (
      typeof lat === "number" &&
      typeof lng === "number" &&
      Number.isFinite(lat) &&
      Number.isFinite(lng)
    ) {
      return { lat, lng };
    }
    return {
      lat: DEFAULT_INDIA_CENTER.lat,
      lng: DEFAULT_INDIA_CENTER.lng,
    };
  }, [defaultValue?.lat, defaultValue?.lng]);

  const [lat, setLat] = useState(initial.lat);
  const [lng, setLng] = useState(initial.lng);
  const [addressString, setAddressString] = useState(
    () => prefillAddress?.trim() ?? ""
  );
  const [geoBusy, setGeoBusy] = useState(false);
  const [reverseBusy, setReverseBusy] = useState(false);
  const [reverseError, setReverseError] = useState<string | null>(null);

  useEffect(() => {
    setLat(initial.lat);
    setLng(initial.lng);
    reversePrefetchSig.current = null;
  }, [initial.lat, initial.lng]);

  useEffect(() => {
    const p = prefillAddress?.trim();
    if (p) setAddressString(p);
  }, [prefillAddress]);

  const emit = useCallback(
    (nextLat: number, nextLng: number, addr: string, pincode?: string) => {
      onChange({
        lat: nextLat,
        lng: nextLng,
        address: addr,
        ...(pincode ? { pincode } : {}),
      });
    },
    [onChange]
  );

  const runReverse = useCallback(
    async (nextLat: number, nextLng: number) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setReverseBusy(true);
      setReverseError(null);
      try {
        const { displayName, pincode } = await reverseGeocode(
          nextLat,
          nextLng,
          ac.signal
        );
        const addr =
          displayName || `${nextLat.toFixed(5)}, ${nextLng.toFixed(5)}`;
        setAddressString(addr);
        emit(nextLat, nextLng, addr, pincode);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        const addr = `${nextLat.toFixed(5)}, ${nextLng.toFixed(5)}`;
        setAddressString(addr);
        setReverseError(
          "Could not resolve address — coordinates shown instead."
        );
        emit(nextLat, nextLng, addr);
      } finally {
        setReverseBusy(false);
      }
    },
    [emit]
  );

  const scheduleReverse = useCallback(
    (nextLat: number, nextLng: number) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        debounceTimer.current = null;
        void runReverse(nextLat, nextLng);
      }, 450);
    },
    [runReverse]
  );

  useEffect(
    () => () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    },
    []
  );

  /** Prefill: reverse-geocode when coordinates exist but no prefill address (skip bare India default). */
  useEffect(() => {
    const hint = prefillAddress?.trim();
    if (hint) return;
    const india =
      Math.abs(initial.lat - DEFAULT_INDIA_CENTER.lat) < 1e-4 &&
      Math.abs(initial.lng - DEFAULT_INDIA_CENTER.lng) < 1e-4;
    if (india) return;
    const sig = `${initial.lat.toFixed(5)}|${initial.lng.toFixed(5)}`;
    if (reversePrefetchSig.current === sig) return;
    reversePrefetchSig.current = sig;
    void runReverse(initial.lat, initial.lng);
  }, [initial.lat, initial.lng, prefillAddress, runReverse]);

  const applyCoords = useCallback(
    (nextLat: number, nextLng: number, immediateReverse: boolean) => {
      setLat(nextLat);
      setLng(nextLng);
      if (immediateReverse) {
        void runReverse(nextLat, nextLng);
      } else {
        scheduleReverse(nextLat, nextLng);
      }
    },
    [runReverse, scheduleReverse]
  );

  const onLocate = useCallback(() => {
    if (
      disabled ||
      typeof navigator === "undefined" ||
      !navigator.geolocation
    ) {
      setReverseError("Geolocation is not available in this browser.");
      return;
    }
    setGeoBusy(true);
    setReverseError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const la = pos.coords.latitude;
        const ln = pos.coords.longitude;
        applyCoords(la, ln, true);
        setGeoBusy(false);
      },
      () => {
        setGeoBusy(false);
        setReverseError(
          "Could not read your location — allow permission or place the pin manually."
        );
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 }
    );
  }, [applyCoords, disabled]);

  const centerTuple = useMemo<[number, number]>(
    () => [lat, lng],
    [lat, lng]
  );

  const mapProps: LeafletLocationMapProps = {
    center: centerTuple,
    onMarkerDragEnd: (lla, lln) => applyCoords(lla, lln, false),
    onMapClick: disabled ? undefined : (lla, lln) => applyCoords(lla, lln, false),
    className: "z-0 h-[280px] w-full rounded-lg border border-border",
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative overflow-hidden rounded-lg">
        <LeafletLocationMap {...mapProps} />
        <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center px-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled || geoBusy}
            className="pointer-events-auto shadow-md"
            onClick={onLocate}
          >
            {geoBusy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Crosshair className="size-4" aria-hidden />
            )}
            <span className="ml-2">Use my current location</span>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
        <div className="flex items-start gap-2">
          <MapPin
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Resolved address
            </p>
            <p className="mt-1 whitespace-pre-wrap text-foreground">
              {reverseBusy ? (
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Looking up address…
                </span>
              ) : (
                addressString || "Move the pin, tap the map, or use current location."
              )}
            </p>
            {reverseError ? (
              <p className="mt-1 text-xs text-destructive">{reverseError}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

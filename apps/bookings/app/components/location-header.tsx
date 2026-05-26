"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, ChevronDown, Loader2, Navigation } from "lucide-react";
import { Drawer } from "vaul";
import { useLocationStore } from "../stores/location-store";
import { getMapsProvider } from "./booking/maps-config";
import {
  nominatimSearch,
  nominatimReverse,
  type NominatimSearchHit,
} from "./booking/nominatim-client";

function useGoogleAutocomplete(
  inputRef: React.RefObject<HTMLInputElement | null>,
  onSelect: (lat: number, lng: number, address: string) => void
) {
  const acRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (getMapsProvider() !== "google") return;
    if (!inputRef.current) return;
    if (typeof google === "undefined" || !google.maps?.places) return;

    const ac = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "in" },
      fields: ["geometry", "formatted_address"],
    });

    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (!place?.geometry?.location) return;
      onSelect(
        place.geometry.location.lat(),
        place.geometry.location.lng(),
        place.formatted_address ?? ""
      );
    });

    acRef.current = ac;
    return () => {
      google.maps.event.clearInstanceListeners(ac);
    };
  }, [inputRef, onSelect]);
}

function LocationSearchDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const setLocation = useLocationStore((s) => s.setLocation);
  const setLocating = useLocationStore((s) => s.setLocating);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<NominatimSearchHit[]>([]);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSelect = useCallback(
    (lat: number, lng: number, address: string) => {
      setLocation(lat, lng, address);
      setQuery("");
      setHits([]);
      onOpenChange(false);
    },
    [setLocation, onOpenChange]
  );

  useGoogleAutocomplete(inputRef, handleSelect);

  useEffect(() => {
    if (getMapsProvider() === "google") return;
    const q = query.trim();
    if (q.length < 3) {
      setHits([]);
      return;
    }
    const timer = setTimeout(() => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setBusy(true);
      nominatimSearch(q, ac.signal)
        .then(setHits)
        .catch((e) => {
          if ((e as Error).name !== "AbortError") setHits([]);
        })
        .finally(() => setBusy(false));
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (getMapsProvider() === "google" && typeof google !== "undefined") {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
              handleSelect(lat, lng, results[0].formatted_address ?? "");
            } else {
              handleSelect(lat, lng, `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
            }
          });
        } else {
          nominatimReverse(lat, lng)
            .then((r) => handleSelect(lat, lng, r.displayName))
            .catch(() =>
              handleSelect(lat, lng, `${lat.toFixed(5)}, ${lng.toFixed(5)}`)
            );
        }
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  }, [handleSelect, setLocating]);

  const isGoogle = getMapsProvider() === "google";

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 100,
          }}
        />
        <Drawer.Content
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#ffffff",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            zIndex: 101,
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              backgroundColor: "#cbd5e1",
              borderRadius: 2,
              margin: "10px auto 0",
              flexShrink: 0,
            }}
          />

          <Drawer.Title
            style={{
              padding: "16px 20px 4px",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            Set your location
          </Drawer.Title>
          <Drawer.Description
            style={{
              padding: "0 20px 12px",
              fontSize: "0.82rem",
              color: "#64748b",
            }}
          >
            We&apos;ll show equipment available in your area
          </Drawer.Description>

          <div style={{ padding: "0 20px 8px" }}>
            <button
              type="button"
              onClick={handleLocateMe}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1.5px solid #e2e8f0",
                backgroundColor: "#f0fdf4",
                cursor: "pointer",
                fontSize: "0.88rem",
                fontWeight: 600,
                color: "#16a34a",
                transition: "background 0.15s",
              }}
            >
              <Navigation size={18} />
              Use my current location
            </button>
          </div>

          <div style={{ padding: "0 20px 12px", position: "relative" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                backgroundColor: "#f8f9fa",
                border: "1.5px solid #e2e8f0",
                borderRadius: 12,
                padding: "0 14px",
                height: 48,
              }}
            >
              <MapPin size={18} color="#94a3b8" style={{ flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for area, street name..."
                autoFocus
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: "0.92rem",
                  color: "#0f172a",
                  height: "100%",
                }}
                autoComplete="off"
              />
              {busy && <Loader2 size={16} className="animate-spin" color="#94a3b8" />}
            </div>
          </div>

          {!isGoogle && hits.length > 0 && (
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "0 8px 20px",
              }}
            >
              {hits.map((hit, i) => (
                <button
                  key={`${hit.lat}-${hit.lng}-${i}`}
                  type="button"
                  onClick={() => handleSelect(hit.lat, hit.lng, hit.displayName)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    width: "100%",
                    textAlign: "left",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    color: "#334155",
                    lineHeight: 1.4,
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <MapPin
                    size={16}
                    color="#d45800"
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {hit.displayName}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export function LocationHeader() {
  const { formattedAddress, isResolved, isLocating, setLocation, setLocating } =
    useLocationStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (isResolved) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (getMapsProvider() === "google" && typeof google !== "undefined") {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
              setLocation(lat, lng, results[0].formatted_address ?? "");
            } else {
              setLocation(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            }
          });
        } else {
          nominatimReverse(lat, lng)
            .then((r) =>
              setLocation(lat, lng, r.displayName || `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
            )
            .catch(() =>
              setLocation(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
            );
        }
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 300_000 }
    );
  }, [isResolved, setLocation, setLocating]);

  const displayText = isLocating
    ? "Detecting location..."
    : isResolved && formattedAddress
      ? formattedAddress
      : "Set your location";

  const truncated =
    displayText.length > 38 ? displayText.slice(0, 38) + "…" : displayText;

  return (
    <>
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 14px",
          borderRadius: 24,
          border: "1.5px solid #e2e8f0",
          backgroundColor: "#ffffff",
          cursor: "pointer",
          maxWidth: "100%",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#d45800";
          e.currentTarget.style.boxShadow = "0 0 0 2px rgba(212,88,0,0.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#e2e8f0";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <MapPin
          size={16}
          color={isResolved ? "#d45800" : "#94a3b8"}
          style={{ flexShrink: 0 }}
        />
        <span
          style={{
            fontSize: "0.82rem",
            fontWeight: 600,
            color: isResolved ? "#0f172a" : "#64748b",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {isLocating ? (
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Loader2 size={12} className="animate-spin" />
              Detecting...
            </span>
          ) : (
            truncated
          )}
        </span>
        <ChevronDown size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
      </button>

      <LocationSearchDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}

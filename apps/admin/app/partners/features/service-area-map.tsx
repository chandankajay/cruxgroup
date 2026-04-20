"use client";

import type { CSSProperties } from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Circle,
  Autocomplete,
} from "@react-google-maps/api";
import type { Libraries } from "@react-google-maps/api";

const LIBRARIES: Libraries = ["places"];
const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };
const DEFAULT_MAP_CONTAINER_STYLE: CSSProperties = { width: "100%", height: "480px" };

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  gestureHandling: "greedy",
};

const CIRCLE_OPTIONS = {
  strokeColor: "#F97316",
  strokeOpacity: 0.9,
  strokeWeight: 2,
  fillColor: "#FED7AA",
  fillOpacity: 0.25,
  clickable: false,
  draggable: false,
  editable: false,
  zIndex: 1,
};

const AUTOCOMPLETE_OPTIONS = {
  componentRestrictions: { country: "in" },
  fields: ["geometry", "formatted_address"],
};

const INPUT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2";

type LatLng = { lat: number; lng: number };

interface ServiceAreaMapProps {
  /** Overrides default `480px` map height (e.g. mobile viewport minus chrome). */
  readonly mapContainerStyle?: CSSProperties;
  initialLocation: LatLng | null;
  initialRadius: number;
  initialBaseAddress: string;
  onSave: (data: {
    lat: number;
    lng: number;
    maxServiceRadius: number;
    baseAddress: string;
  }) => Promise<void>;
  isSaving: boolean;
}

function kmToMeters(km: number) {
  return km * 1000;
}

/** Fit the map viewport so the full circle is visible. */
function fitMapToCircle(map: google.maps.Map, center: LatLng, radiusKm: number) {
  const radiusDeg = radiusKm / 111;
  const bounds = new google.maps.LatLngBounds(
    { lat: center.lat - radiusDeg, lng: center.lng - radiusDeg },
    { lat: center.lat + radiusDeg, lng: center.lng + radiusDeg }
  );
  map.fitBounds(bounds, 40);
}

export function ServiceAreaMap({
  mapContainerStyle,
  initialLocation,
  initialRadius,
  initialBaseAddress,
  onSave,
  isSaving,
}: ServiceAreaMapProps) {
  const resolvedMapContainerStyle: CSSProperties = {
    ...DEFAULT_MAP_CONTAINER_STYLE,
    ...mapContainerStyle,
  };
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  const [pinLocation, setPinLocation] = useState<LatLng | null>(initialLocation);
  const [radius, setRadius] = useState<number>(initialRadius);
  const [baseAddress, setBaseAddress] = useState(initialBaseAddress);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const markDirty = useCallback(() => setHasUnsavedChanges(true), []);

  // Fit map when pin + radius are known after load.
  useEffect(() => {
    if (mapRef.current && pinLocation) {
      fitMapToCircle(mapRef.current, pinLocation, radius);
    }
  }, [isLoaded, pinLocation, radius]);

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (initialLocation) {
      fitMapToCircle(map, initialLocation, initialRadius);
    }
  }, [initialLocation, initialRadius]);

  // Click anywhere on the map to drop/move the pin.
  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const newPos: LatLng = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setPinLocation(newPos);

      // Reverse-geocode to get a human-readable address.
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: newPos }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
          setBaseAddress(results[0].formatted_address);
        }
      });

      markDirty();
    },
    [markDirty]
  );

  // Dragging the marker also updates the pin.
  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const newPos: LatLng = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setPinLocation(newPos);

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: newPos }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
          setBaseAddress(results[0].formatted_address);
        }
      });

      if (mapRef.current) {
        fitMapToCircle(mapRef.current, newPos, radius);
      }
      markDirty();
    },
    [radius, markDirty]
  );

  const handleAutocompleteLoad = useCallback(
    (ac: google.maps.places.Autocomplete) => {
      autocompleteRef.current = ac;
    },
    []
  );

  const handlePlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) return;

    const newPos: LatLng = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    setPinLocation(newPos);
    if (place.formatted_address) setBaseAddress(place.formatted_address);
    if (mapRef.current) {
      fitMapToCircle(mapRef.current, newPos, radius);
    }
    markDirty();
  }, [radius, markDirty]);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newPos: LatLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: newPos }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
            setBaseAddress(results[0].formatted_address);
          }
        });
        setPinLocation(newPos);
        if (mapRef.current) {
          fitMapToCircle(mapRef.current, newPos, radius);
        }
        markDirty();
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [radius, markDirty]);

  const handleRadiusChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newRadius = Number(e.target.value);
      setRadius(newRadius);
      if (mapRef.current && pinLocation) {
        fitMapToCircle(mapRef.current, pinLocation, newRadius);
      }
      markDirty();
    },
    [pinLocation, markDirty]
  );

  const handleSaveClick = useCallback(async () => {
    if (!pinLocation) return;
    await onSave({ ...pinLocation, maxServiceRadius: radius, baseAddress });
    setHasUnsavedChanges(false);
  }, [pinLocation, radius, baseAddress, onSave]);

  if (!apiKey) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <strong>Google Maps API key missing.</strong> Add{" "}
        <code className="rounded bg-amber-100 px-1 font-mono text-xs">
          NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        </code>{" "}
        to <code className="rounded bg-amber-100 px-1 font-mono text-xs">apps/admin/.env</code>{" "}
        to enable the interactive service area map.
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load Google Maps. Check your API key and ensure the Maps
        JavaScript API and Places API are enabled in Google Cloud Console.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="space-y-4">
        <div className="h-10 animate-pulse rounded-md bg-muted" />
        <div
          className="animate-pulse rounded-xl bg-muted"
          style={{ height: resolvedMapContainerStyle.height ?? "480px" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Address search + Locate Me */}
      <div className="flex gap-2">
        <div className="min-w-0 flex-1">
          <Autocomplete
            onLoad={handleAutocompleteLoad}
            onPlaceChanged={handlePlaceChanged}
            options={AUTOCOMPLETE_OPTIONS}
          >
            <input
              value={baseAddress}
              onChange={(e) => {
                setBaseAddress(e.target.value);
                markDirty();
              }}
              placeholder="Search base location…"
              className={INPUT_CLASS}
              autoComplete="off"
            />
          </Autocomplete>
        </div>
        <button
          type="button"
          onClick={handleLocateMe}
          title="Use my current location"
          className="inline-flex h-12 min-w-11 shrink-0 touch-manipulation select-none items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 text-sm font-medium text-amber-800 active:bg-amber-200 lg:h-10 lg:rounded-md lg:hover:bg-amber-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
          Locate Me
        </button>
      </div>

      {/* Instruction hint */}
      {!pinLocation && (
        <p className="rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-700">
          Click anywhere on the map to drop a pin on the partner&apos;s base
          location.
        </p>
      )}

      {/* Map */}
      <div className="overflow-hidden rounded-xl border border-border shadow-sm">
        <GoogleMap
          mapContainerStyle={resolvedMapContainerStyle}
          center={pinLocation ?? INDIA_CENTER}
          zoom={pinLocation ? 10 : 5}
          options={MAP_OPTIONS}
          onLoad={handleMapLoad}
          onClick={handleMapClick}
        >
          {pinLocation && (
            <>
              <Marker
                position={pinLocation}
                draggable
                onDragEnd={handleMarkerDragEnd}
                title="Base location — drag to adjust"
                icon={{
                  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z",
                  fillColor: "#EA580C",
                  fillOpacity: 1,
                  strokeColor: "#C2410C",
                  strokeWeight: 1.5,
                  scale: 1.8,
                  anchor: { x: 12, y: 22 } as unknown as google.maps.Point,
                }}
              />
              <Circle
                center={pinLocation}
                radius={kmToMeters(radius)}
                options={CIRCLE_OPTIONS}
              />
            </>
          )}
        </GoogleMap>
      </div>

      {/* Radius slider */}
      <div className="rounded-xl border border-border bg-gray-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-semibold text-charcoal">
            Max Service Radius
          </label>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">
            {radius} km
          </span>
        </div>

        <input
          type="range"
          min={1}
          max={100}
          step={1}
          value={radius}
          onChange={handleRadiusChange}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-amber-200 accent-amber-500"
        />

        <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
          <span>1 km</span>
          <span>50 km</span>
          <span>100 km</span>
        </div>

        {pinLocation && (
          <p className="mt-3 text-xs text-muted-foreground">
            The orange circle shows the area your partner covers. Cities and
            towns inside the circle will see their equipment in search results.
          </p>
        )}
      </div>

      {/* Current pin info */}
      {pinLocation && (
        <div className="rounded-lg border border-border bg-white px-4 py-3 text-sm">
          <p className="font-medium text-charcoal">Base location</p>
          <p className="mt-0.5 text-muted-foreground">{baseAddress || "—"}</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {pinLocation.lat.toFixed(6)}, {pinLocation.lng.toFixed(6)}
          </p>
        </div>
      )}

      {/* Save button */}
      <div className="flex items-center justify-between pt-1">
        {hasUnsavedChanges && !isSaving && (
          <p className="text-xs text-amber-700">You have unsaved changes.</p>
        )}
        <div className="ml-auto">
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={!pinLocation || isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Saving…
              </>
            ) : (
              "Save Service Area"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

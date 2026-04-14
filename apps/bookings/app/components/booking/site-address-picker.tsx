"use client";

import { useState, useRef, useCallback } from "react";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import type { Libraries } from "@react-google-maps/api";

// Must be a stable module-level constant — recreating this array causes @react-google-maps/api
// to reload the Maps JS SDK on every render.
const LIBRARIES: Libraries = ["places"];

const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };

const MAP_CONTAINER_STYLE = { width: "100%", height: "200px" };

// Official Google Maps "Silver" style — clean neutral tones that complement Navy/Orange branding
const SILVER_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#e5e5e5" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#dadada" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [{ color: "#e5e5e5" }],
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#c9c9c9" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
];

const MAP_OPTIONS = {
  styles: SILVER_STYLES,
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
  gestureHandling: "cooperative",
};

const AUTOCOMPLETE_OPTIONS = {
  componentRestrictions: { country: "in" },
  fields: ["geometry", "formatted_address"],
};

const INPUT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

interface SiteAddressPickerProps {
  readonly address: string;
  readonly onAddressChange: (address: string) => void;
  readonly placeholder?: string;
}

type LatLng = { lat: number; lng: number };

function MapSkeleton() {
  return (
    <div
      style={{ width: "100%", height: "200px" }}
      className="animate-pulse rounded-lg bg-muted"
    />
  );
}

function PlainAddressInput({
  address,
  onAddressChange,
  placeholder,
  warning,
}: SiteAddressPickerProps & { warning?: string }) {
  return (
    <div className="space-y-1">
      <input
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
        placeholder={placeholder ?? "Enter site address"}
        className={INPUT_CLASS}
      />
      {warning && (
        <p className="text-xs text-amber-600">{warning}</p>
      )}
    </div>
  );
}

export function SiteAddressPicker({
  address,
  onAddressChange,
  placeholder,
}: SiteAddressPickerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  const [markerPos, setMarkerPos] = useState<LatLng>(INDIA_CENTER);

  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

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
    setMarkerPos(newPos);
    mapRef.current?.panTo(newPos);
    mapRef.current?.setZoom(15);

    if (place.formatted_address) {
      onAddressChange(place.formatted_address);
    }
  }, [onAddressChange]);

  const handleDragEnd = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;

      const newPos: LatLng = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      setMarkerPos(newPos);

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: newPos }, (results, status) => {
        if (
          status === google.maps.GeocoderStatus.OK &&
          results?.[0]?.formatted_address
        ) {
          onAddressChange(results[0].formatted_address);
        }
      });
    },
    [onAddressChange]
  );

  if (!apiKey) {
    return (
      <PlainAddressInput
        address={address}
        onAddressChange={onAddressChange}
        placeholder={placeholder}
        warning="Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env to enable the interactive map."
      />
    );
  }

  if (loadError) {
    return (
      <PlainAddressInput
        address={address}
        onAddressChange={onAddressChange}
        placeholder={placeholder}
        warning="Map failed to load. Enter address manually."
      />
    );
  }

  if (!isLoaded) {
    return (
      <div className="space-y-2">
        <div className="h-10 animate-pulse rounded-md bg-muted" />
        <MapSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Autocomplete
        onLoad={handleAutocompleteLoad}
        onPlaceChanged={handlePlaceChanged}
        options={AUTOCOMPLETE_OPTIONS}
      >
        <input
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder={placeholder ?? "Search site address…"}
          className={INPUT_CLASS}
        />
      </Autocomplete>

      <div className="overflow-hidden rounded-lg border border-border shadow-sm">
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={markerPos}
          zoom={5}
          options={MAP_OPTIONS}
          onLoad={handleMapLoad}
        >
          <Marker
            position={markerPos}
            draggable
            onDragEnd={handleDragEnd}
            icon={{
              path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z",
              fillColor: "#F97316",
              fillOpacity: 1,
              strokeColor: "#EA580C",
              strokeWeight: 1.5,
              scale: 1.6,
              anchor: { x: 12, y: 22 } as unknown as google.maps.Point,
            }}
          />
        </GoogleMap>
      </div>

      <p className="text-xs text-muted-foreground">
        Drag the pin to adjust the exact site location.
      </p>
    </div>
  );
}

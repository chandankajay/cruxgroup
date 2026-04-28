"use client";

import { useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { DEFAULT_INDIA_CENTER } from "./geo-defaults";

/** Fix Leaflet default marker URLs under bundlers (Next.js). */
function ensureLeafletIcons(): void {
  const IconDefault = L.Icon.Default.prototype as unknown as {
    _getIconUrl?: string;
  };
  delete IconDefault._getIconUrl;
  L.Icon.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

function MapViewSync({ center }: { readonly center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, Math.max(map.getZoom(), 13), { animate: true });
  }, [center[0], center[1], map]);
  return null;
}

function MapClickPlace({
  enabled,
  onPlace,
}: {
  readonly enabled: boolean;
  readonly onPlace: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (!enabled) return;
      onPlace(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export interface LeafletLocationMapProps {
  readonly center: [number, number];
  readonly onMarkerDragEnd: (lat: number, lng: number) => void;
  readonly onMapClick?: (lat: number, lng: number) => void;
  readonly className?: string;
}

/**
 * Leaflet implementation detail — swap this module for a Google Maps adapter later;
 * keep {@link ../location-picker}’s public props stable.
 */
export function LeafletLocationMap({
  center,
  onMarkerDragEnd,
  onMapClick,
  className,
}: LeafletLocationMapProps) {
  useEffect(() => {
    ensureLeafletIcons();
  }, []);

  const position: [number, number] = [center[0], center[1]];

  return (
    <MapContainer
      center={position}
      zoom={13}
      className={className ?? "z-0 h-[280px] w-full rounded-lg border border-border"}
      scrollWheelZoom
      aria-label="Job site map — drag the pin or tap the map to set location"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapViewSync center={position} />
      <MapClickPlace
        enabled={typeof onMapClick === "function"}
        onPlace={
          typeof onMapClick === "function"
            ? onMapClick
            : () => {
                /* no-op */
              }
        }
      />
      <Marker
        position={position}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const ll = e.target.getLatLng();
            onMarkerDragEnd(ll.lat, ll.lng);
          },
        }}
      />
    </MapContainer>
  );
}

export { DEFAULT_INDIA_CENTER };
"use client";

import dynamic from "next/dynamic";
import { getMapsProvider } from "./maps-config";
import type { SiteAddressPickerProps } from "./site-address-picker-types";
import { SiteAddressPickerGoogle } from "./site-address-picker-google";

const SiteAddressPickerOsm = dynamic(
  () =>
    import("./site-address-picker-osm").then((m) => m.SiteAddressPickerOsm),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-2">
        <div className="h-10 animate-pulse rounded-md bg-muted" />
        <div className="h-[200px] w-full animate-pulse rounded-lg border border-border bg-muted" />
      </div>
    ),
  }
);

export type { SiteAddressPickerProps } from "./site-address-picker-types";

/**
 * Facade: swap implementation via `NEXT_PUBLIC_MAPS_PROVIDER` (`osm` | `google`).
 * @see maps-config.ts
 */
export function SiteAddressPicker(props: SiteAddressPickerProps) {
  if (getMapsProvider() === "google") {
    return <SiteAddressPickerGoogle {...props} />;
  }
  return <SiteAddressPickerOsm {...props} />;
}

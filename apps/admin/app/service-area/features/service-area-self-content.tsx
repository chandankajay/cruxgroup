"use client";

import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { ServiceAreaMap } from "../../partners/features/service-area-map";
import { updateServiceAreaAction } from "../../partners/actions";
import { useIsLgUp } from "../../lib/use-media-query";

interface ServiceAreaSelfContentProps {
  readonly partnerId: string;
  readonly partnerName: string;
  readonly initialLocation: { lat: number; lng: number } | null;
  readonly initialRadius: number;
  readonly initialBaseAddress: string;
}

export function ServiceAreaSelfContent({
  partnerId,
  partnerName,
  initialLocation,
  initialRadius,
  initialBaseAddress,
}: ServiceAreaSelfContentProps) {
  const [isSaving, setIsSaving] = useState(false);
  const isLg = useIsLgUp();

  const mobileMapStyle = useMemo(() => {
    if (isLg === true) return undefined;
    return {
      width: "100%",
      height: "calc(100dvh - 56px - 64px - env(safe-area-inset-bottom))",
    } as const;
  }, [isLg]);

  const handleSave = useCallback(
    async (data: {
      lat: number;
      lng: number;
      maxServiceRadius: number;
      baseAddress: string;
    }) => {
      setIsSaving(true);
      const result = await updateServiceAreaAction({ id: partnerId, ...data });

      if (result.success) {
        toast.success("Service area saved!", {
          description: "Customers in your area can now find your equipment.",
        });
      } else {
        toast.error("Save failed", {
          description: result.error ?? "Please try again.",
        });
      }
      setIsSaving(false);
    },
    [partnerId]
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="select-none text-2xl font-semibold tracking-tight text-charcoal">
          Service Area
        </h1>
        <p className="mt-1 text-sm text-zinc-600 lg:text-muted-foreground">
          Set your base location and define how far you can deliver equipment.
        </p>
      </div>

      {!initialLocation && (
        <div className="mb-6 rounded-2xl border border-amber-500/50 bg-amber-50 px-4 py-4 select-none">
          <p className="text-sm font-semibold text-amber-800">No base location set yet</p>
          <p className="mt-1 text-sm text-amber-700">
            Tap the map to drop a pin on your depot or base location. Set your service radius and save
            — customers searching nearby will then see your equipment in results.
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm select-none">
        <div className="border-b border-border px-4 py-4 lg:px-6">
          <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-400">Coverage</h2>
          <p className="mt-1 font-semibold text-charcoal">{partnerName}</p>
          <p className="mt-0.5 text-sm text-zinc-600 lg:text-muted-foreground">
            Tap the map to set your base · drag the pin to fine-tune · adjust the slider to change coverage
            radius
          </p>
        </div>
        <div className="p-4 lg:p-6">
          <ServiceAreaMap
            mapContainerStyle={mobileMapStyle}
            initialLocation={initialLocation}
            initialRadius={initialRadius}
            initialBaseAddress={initialBaseAddress}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { ServiceAreaMap } from "../../partners/features/service-area-map";
import { updateServiceAreaAction } from "../../partners/actions";

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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-charcoal">Service Area</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set your base location and define how far you can deliver equipment.
        </p>
      </div>

      {/* Info banner if no location set */}
      {!initialLocation && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm font-semibold text-amber-800">
            📍 No base location set yet
          </p>
          <p className="mt-1 text-sm text-amber-700">
            Click anywhere on the map to drop a pin on your depot or base
            location. Set your service radius and save — customers searching
            nearby will then see your equipment in results.
          </p>
        </div>
      )}

      {/* Map panel */}
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-semibold text-charcoal">{partnerName}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Click the map to set your base · drag the pin to fine-tune ·
            adjust the slider to change coverage radius
          </p>
        </div>
        <div className="p-6">
          <ServiceAreaMap
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

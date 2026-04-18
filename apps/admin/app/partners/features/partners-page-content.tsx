"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { ServiceAreaMap } from "./service-area-map";
import { PartnerKycForm } from "./partner-kyc-form";
import { updateServiceAreaAction } from "../actions";

interface PartnerLocation {
  type: string;
  coordinates: number[];
}

interface Partner {
  id: string;
  name: string;
  phoneNumber?: string | null;
  email?: string | null;
  baseAddress?: string | null;
  location?: PartnerLocation | null;
  maxServiceRadius?: number | null;
}

interface PartnersPageContentProps {
  readonly partners: Partner[];
}

function PartnerRow({
  partner,
  isSelected,
  onSelect,
}: {
  partner: Partner;
  isSelected: boolean;
  onSelect: (p: Partner) => void;
}) {
  const hasLocation = !!partner.location?.coordinates?.length;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(partner)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(partner)}
      className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 transition-colors ${
        isSelected
          ? "border-brand-orange bg-orange-50"
          : "border-border bg-white hover:border-brand-orange/40 hover:bg-orange-50/30"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-charcoal">
          {partner.name || "Unnamed Partner"}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {partner.phoneNumber ?? partner.email ?? "No contact"}
        </p>
        {partner.baseAddress && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            📍 {partner.baseAddress}
          </p>
        )}
      </div>
      <div className="ml-3 shrink-0 text-right">
        {hasLocation ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
            ✓ Area set
            {partner.maxServiceRadius ? ` · ${partner.maxServiceRadius} km` : ""}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
            ⚠ No area
          </span>
        )}
      </div>
    </div>
  );
}

export function PartnersPageContent({ partners }: PartnersPageContentProps) {
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(
    partners[0] ?? null
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(
    async (data: {
      lat: number;
      lng: number;
      maxServiceRadius: number;
      baseAddress: string;
    }) => {
      if (!selectedPartner) return;
      setIsSaving(true);

      const result = await updateServiceAreaAction({
        id: selectedPartner.id,
        ...data,
      });

      if (result.success) {
        toast.success("Service area saved", {
          description: `${selectedPartner.name ?? "Partner"}'s settings updated.`,
        });
        // Update local state so the badge reflects immediately.
        setSelectedPartner((prev) =>
          prev
            ? {
                ...prev,
                location: {
                  type: "Point",
                  coordinates: [data.lng, data.lat],
                },
                maxServiceRadius: data.maxServiceRadius,
                baseAddress: data.baseAddress,
              }
            : prev
        );
      } else {
        toast.error("Save failed", {
          description: result.error ?? "Please try again.",
        });
      }

      setIsSaving(false);
    },
    [selectedPartner]
  );

  const initialLocation =
    selectedPartner?.location?.coordinates?.length === 2
      ? {
          lat: selectedPartner.location.coordinates[1],
          lng: selectedPartner.location.coordinates[0],
        }
      : null;

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-charcoal">Partners</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a partner to configure their service area, KYC identifiers, and base
          location.
        </p>
      </div>

      {partners.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No partners found. Add users with role{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">PARTNER</code>{" "}
            to manage their service areas here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          {/* Partner list */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {partners.length} Partner{partners.length !== 1 ? "s" : ""}
            </p>
            {partners.map((p) => (
              <PartnerRow
                key={p.id}
                partner={p}
                isSelected={selectedPartner?.id === p.id}
                onSelect={setSelectedPartner}
              />
            ))}
          </div>

          {/* Service area map panel */}
          {selectedPartner && (
            <div className="flex flex-col gap-6">
              <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                <div className="border-b border-border px-6 py-4">
                  <h2 className="font-semibold text-charcoal">
                    {selectedPartner.name ?? "Partner"} — Service Area
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Click the map to drop a pin on their base. Drag the pin or
                    adjust the slider to change the radius.
                  </p>
                </div>

                <div className="p-6">
                  <ServiceAreaMap
                    key={selectedPartner.id}
                    initialLocation={initialLocation}
                    initialRadius={selectedPartner.maxServiceRadius ?? 10}
                    initialBaseAddress={selectedPartner.baseAddress ?? ""}
                    onSave={handleSave}
                    isSaving={isSaving}
                  />
                </div>
              </div>

              <PartnerKycForm
                partnerUserId={selectedPartner.id}
                partnerName={selectedPartner.name ?? "Partner"}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

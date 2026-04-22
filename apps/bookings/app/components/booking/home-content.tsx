"use client";

import { useState, useMemo, useCallback, useTransition } from "react";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import { useLabels } from "@repo/ui/dictionary-provider";
import { createBookingAction } from "../../actions/booking";
import { EquipmentGrid } from "./equipment-grid";
import { BookingDrawer } from "./booking-drawer";
import { BookingSuccess } from "./booking-success";

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  subType?: string | null;
  hourlyRate?: number;
  pricing: { hourly: number; daily: number };
  images: string[];
  specifications: unknown;
}

interface HomeContentProps {
  readonly equipment: EquipmentItem[];
}

interface BookingFormData {
  equipmentId: string;
  address: string;
  pincode: string;
  lat: number;
  lng: number;
  pricingUnit: "daily" | "hourly";
  duration: number;
  startDate: Date;
  endDate: Date;
}

export function HomeContent({ equipment }: HomeContentProps) {
  const t = useLabels();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectedEquipment = useMemo(
    () => equipment.find((e) => e.id === selectedId) ?? null,
    [equipment, selectedId]
  );

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedId(null);
  }, []);

  const handleBooking = useCallback((data: BookingFormData) => {
    startTransition(async () => {
      try {
        const result = await createBookingAction({
          equipmentId: data.equipmentId,
          address: data.address,
          pincode: data.pincode,
          lat: data.lat,
          lng: data.lng,
          pricingUnit: data.pricingUnit,
          duration: data.duration,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
        });

        if (result.success) {
          toast.success("Booking Requested!", {
            description: "We will contact you shortly to confirm your booking.",
          });
          setSelectedId(null);
          setShowSuccess(true);
        } else {
          const err = result.error ?? "Something went wrong. Please try again.";
          const isOutOfArea = /service area|outside the partner/i.test(err);
          toast.error(isOutOfArea ? "Out of service area" : "Booking failed", {
            description: err,
          });
        }
      } catch {
        toast.error("Booking Failed", {
          description: "An unexpected error occurred. Please try again.",
        });
      }
    });
  }, []);

  const handleDismissSuccess = useCallback(() => {
    setShowSuccess(false);
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <BookingSuccess onDismiss={handleDismissSuccess} />
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-brand-navy">
                {t("EQUIPMENT_GRID_TITLE")}
              </h1>
              <p className="mt-1 text-muted-foreground">
                {t("HOME_SUBTITLE")}
              </p>
            </div>
            <EquipmentGrid
              items={equipment as (EquipmentItem & { specifications: Record<string, unknown> })[]}
              onSelect={handleSelect}
            />
          </>
        )}
      </AnimatePresence>

      <BookingDrawer
        equipment={selectedEquipment}
        open={selectedId !== null}
        onClose={handleCloseDrawer}
        onSubmit={handleBooking}
        isSubmitting={isPending}
      />
    </section>
  );
}

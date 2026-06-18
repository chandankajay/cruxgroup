"use client";

import { useState, useMemo, useCallback, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import { useLabels } from "@repo/ui/dictionary-provider";
import { createBookingAction } from "../../actions/booking";
import { fetchNearbyEquipment } from "../../actions/equipment";
import { useLocationStore } from "../../stores/location-store";
import { EquipmentGrid } from "./equipment-grid";
import { WhatsAppFallbackCard } from "./whatsapp-fallback-card";
import { BookingDrawer } from "./booking-drawer";
import { BookingSuccess } from "./booking-success";
import { LocationHeader } from "../location-header";
import type { NearbyEquipmentItem } from "@repo/api";

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
  readonly fallbackEquipment: EquipmentItem[];
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

const CATEGORIES = ["All", "JCB", "Crane", "Excavator", "Dozer", "Agriculture"] as const;

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 16px",
        borderRadius: 20,
        border: active ? "1.5px solid #d45800" : "1.5px solid #e2e8f0",
        backgroundColor: active ? "#fff0e8" : "#ffffff",
        color: active ? "#d45800" : "#475569",
        fontSize: "0.82rem",
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        whiteSpace: "nowrap",
        flexShrink: 0,
        transition: "all 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}

/** Maps nearby aggregated items to the shape EquipmentGrid expects */
function nearbyToGridItems(nearby: NearbyEquipmentItem[]) {
  return nearby.map((item) => ({
    id: item.catalogId,
    name: item.catalogName,
    category: item.category,
    subType: item.subType,
    pricing: { daily: item.minDailyRate, hourly: item.minHourlyRate },
    images: item.imageUrl ? [item.imageUrl] : [],
    specifications: item.specifications as Record<string, unknown>,
    priceRange:
      item.partnerCount > 1
        ? {
            minDaily: item.minDailyRate,
            maxDaily: item.maxDailyRate,
            minHourly: item.minHourlyRate,
            maxHourly: item.maxHourlyRate,
          }
        : undefined,
    partnerCount: item.partnerCount,
    partners: item.partners,
  }));
}

export function HomeContent({ fallbackEquipment }: HomeContentProps) {
  const t = useLabels();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastBookingId, setLastBookingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [activeCategory, setActiveCategory] = useState("All");
  const [nearbyItems, setNearbyItems] = useState<NearbyEquipmentItem[]>([]);
  const [isNearbyLoading, setIsNearbyLoading] = useState(false);
  /** true once we've completed at least one nearby fetch (distinguishes "never fetched" from "fetched but empty") */
  const [nearbyFetched, setNearbyFetched] = useState(false);

  const { lat, lng, isResolved } = useLocationStore();

  /** Selected partner info when booking from nearby results */
  const [selectedPartner, setSelectedPartner] = useState<{
    equipmentId: string;
    partnerId: string;
    dailyRate: number;
    hourlyRate: number;
  } | null>(null);

  useEffect(() => {
    if (!isResolved || lat == null || lng == null) {
      setNearbyItems([]);
      setNearbyFetched(false);
      return;
    }
    setIsNearbyLoading(true);
    setNearbyFetched(false);
    fetchNearbyEquipment(lat, lng)
      .then(setNearbyItems)
      .catch(() => setNearbyItems([]))
      .finally(() => {
        setIsNearbyLoading(false);
        setNearbyFetched(true);
      });
  }, [lat, lng, isResolved]);

  /** When location is resolved, always use nearby results (even if empty). Only fall back when location isn't set. */
  const locationActive = isResolved && nearbyFetched;

  const gridItems = useMemo(() => {
    if (locationActive) {
      return nearbyToGridItems(nearbyItems);
    }
    return fallbackEquipment.map((e) => ({
      ...e,
      specifications: e.specifications as Record<string, unknown>,
      priceRange: undefined,
      partnerCount: 0,
      partners: [] as NearbyEquipmentItem["partners"],
    }));
  }, [locationActive, nearbyItems, fallbackEquipment]);

  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return gridItems;
    return gridItems.filter(
      (e) => e.category.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [gridItems, activeCategory]);

  const selectedEquipmentForDrawer = useMemo(() => {
    if (!selectedId) return null;
    const item = gridItems.find((e) => e.id === selectedId);
    if (!item) return null;

    if (selectedPartner) {
      return {
        id: selectedPartner.equipmentId,
        name: item.name,
        pricing: {
          daily: selectedPartner.dailyRate,
          hourly: selectedPartner.hourlyRate,
        },
        hourlyRate: selectedPartner.hourlyRate,
      };
    }

    const fallback = fallbackEquipment.find((e) => e.id === selectedId);
    return fallback
      ? {
          id: fallback.id,
          name: fallback.name,
          pricing: fallback.pricing,
          hourlyRate: fallback.hourlyRate,
        }
      : {
          id: item.id,
          name: item.name,
          pricing: item.pricing,
          hourlyRate: item.pricing.hourly,
        };
  }, [selectedId, gridItems, fallbackEquipment, selectedPartner]);

  const handleSelect = useCallback(
    (
      id: string,
      partner?: { equipmentId: string; partnerId: string; dailyRate: number; hourlyRate: number }
    ) => {
      setSelectedId(id);
      setSelectedPartner(partner ?? null);
    },
    []
  );

  const handleCloseDrawer = useCallback(() => {
    setSelectedId(null);
    setSelectedPartner(null);
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
          setSelectedPartner(null);
          setLastBookingId(result.bookingId);
          setShowSuccess(true);
        } else {
          const err =
            result.error ?? "Something went wrong. Please try again.";
          const isOutOfArea = /service area|outside the partner/i.test(err);
          toast.error(
            isOutOfArea ? "Out of service area" : "Booking failed",
            { description: err }
          );
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

  const gridTitle = t("EQUIPMENT_GRID_TITLE");
  const subtitle = t("HOME_SUBTITLE");

  return (
    <div className="pt-0 pb-20 md:pb-0 md:pt-[88px]">
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
            <BookingSuccess
              bookingId={lastBookingId ?? undefined}
              onDismiss={handleDismissSuccess}
            />
          </div>
        ) : (
          <>
            {/* Page header section */}
            <section
              style={{
                backgroundColor: "#ffffff",
                borderBottom: "1px solid #e2e8f0",
                padding: "24px 24px 0",
              }}
              className="md:pt-10"
            >
              <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                {/* Location header — mobile only (desktop has it in the nav bar) */}
                <div style={{ marginBottom: 16 }} className="md:hidden">
                  <LocationHeader />
                </div>

                <p
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#d45800",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  {locationActive
                    ? "Equipment near you"
                    : "Telangana\u2019s Equipment Network"}
                </p>
                <h1
                  style={{
                    fontSize: "clamp(1.5rem, 4vw, 2rem)",
                    fontWeight: 800,
                    color: "#0f172a",
                    marginBottom: 4,
                  }}
                >
                  {gridTitle === "EQUIPMENT_GRID_TITLE"
                    ? "Available Equipment"
                    : gridTitle}
                </h1>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#475569",
                    marginBottom: 20,
                  }}
                >
                  {subtitle === "HOME_SUBTITLE"
                    ? "Book construction equipment in minutes"
                    : subtitle}
                </p>

                {/* Category filter chips */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    overflowX: "auto",
                    padding: "14px 0",
                    scrollbarWidth: "none",
                  }}
                >
                  {CATEGORIES.map((cat) => (
                    <FilterChip
                      key={cat}
                      label={cat}
                      active={activeCategory === cat}
                      onClick={() => setActiveCategory(cat)}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Equipment grid */}
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              {isNearbyLoading ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: 20,
                    padding: "20px 24px",
                  }}
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: "#f1f5f9",
                        borderRadius: 16,
                        height: 320,
                        animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                      }}
                    />
                  ))}
                </div>
              ) : locationActive && gridItems.length === 0 ? (
                <WhatsAppFallbackCard />
              ) : (
                <EquipmentGrid
                  items={filteredItems}
                  onSelect={handleSelect}
                  locationAware={locationActive}
                />
              )}
            </div>
          </>
        )}
      </AnimatePresence>

      <BookingDrawer
        equipment={selectedEquipmentForDrawer}
        open={selectedId !== null}
        onClose={handleCloseDrawer}
        onSubmit={handleBooking}
        isSubmitting={isPending}
      />
    </div>
  );
}

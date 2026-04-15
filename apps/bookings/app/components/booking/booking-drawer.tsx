"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@repo/ui/sheet";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Calendar } from "@repo/ui/calendar";
import { useLabels } from "@repo/ui/dictionary-provider";
import { PriceSummary } from "./price-summary";
import { SiteAddressPicker } from "./site-address-picker";
import type { DateRange } from "react-day-picker";

interface EquipmentForDrawer {
  id: string;
  name: string;
  pricing: { daily: number; hourly: number };
  hourlyRate?: number;
}

interface BookingDrawerProps {
  readonly equipment: EquipmentForDrawer | null;
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (data: {
    equipmentId: string;
    address: string;
    pincode: string;
    lat: number;
    lng: number;
    pricingUnit: "daily" | "hourly";
    duration: number;
    startDate: Date;
    endDate: Date;
  }) => void;
  readonly isSubmitting: boolean;
}

function calculateDays(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function BookingDrawer({
  equipment,
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: BookingDrawerProps) {
  const t = useLabels();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [hourlyDate, setHourlyDate] = useState<Date | undefined>();
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [priceType, setPriceType] = useState<"daily" | "hourly">("daily");
  const [hours, setHours] = useState("1");

  const today = useMemo(() => new Date(), []);

  const days = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    return calculateDays(dateRange.from, dateRange.to);
  }, [dateRange]);

  const duration = useMemo(() => {
    if (priceType === "hourly") {
      const parsed = Number(hours);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    }
    return days;
  }, [days, hours, priceType]);

  useEffect(() => {
    if (!open) {
      setDateRange(undefined);
      setHourlyDate(undefined);
      setAddress("");
      setPincode("");
      setCoords(null);
      setPriceType("daily");
      setHours("1");
    }
  }, [open]);

  const canSubmit =
    equipment &&
    (priceType === "daily" ? (dateRange?.from && dateRange?.to) : hourlyDate) &&
    address.length > 0 &&
    pincode.length >= 4 &&
    duration > 0 &&
    !isSubmitting;

  function handleSubmit() {
    if (!canSubmit || !equipment) return;

    const now = new Date();
    const bookingBase = priceType === "hourly" ? (hourlyDate ?? now) : now;
    const startDate = priceType === "daily" ? (dateRange?.from ?? now) : bookingBase;
    const endDate =
      priceType === "daily"
        ? (dateRange?.to ?? now)
        : new Date(bookingBase.getTime() + Number(hours) * 60 * 60 * 1000);

    onSubmit({
      equipmentId: equipment.id,
      address,
      pincode,
      lat: coords?.lat ?? 0,
      lng: coords?.lng ?? 0,
      pricingUnit: priceType,
      duration,
      startDate,
      endDate,
    });
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-[#1E293B]">{t("DRAWER_TITLE")}</SheetTitle>
          <SheetDescription>{equipment?.name ?? ""}</SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Price Type</Label>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-amber-50 p-1">
              <Button
                type="button"
                variant={priceType === "daily" ? "default" : "ghost"}
                className={
                  priceType === "daily"
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "text-amber-700 hover:bg-amber-100"
                }
                onClick={() => setPriceType("daily")}
              >
                Daily
              </Button>
              <Button
                type="button"
                variant={priceType === "hourly" ? "default" : "ghost"}
                className={
                  priceType === "hourly"
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "text-amber-700 hover:bg-amber-100"
                }
                onClick={() => setPriceType("hourly")}
              >
                Hourly
              </Button>
            </div>
          </div>

          <div>
            {priceType === "daily" ? (
              <>
                <Label className="mb-2 block">{t("DRAWER_SELECT_DATES")}</Label>
                <div className="w-full">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    disabled={{ before: today }}
                    numberOfMonths={1}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label className="mb-2 block">Booking Date</Label>
                  <Calendar
                    mode="single"
                    selected={hourlyDate}
                    onSelect={setHourlyDate}
                    disabled={{ before: today }}
                    numberOfMonths={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="drawer-hours">Total Hours</Label>
                  <Input
                    id="drawer-hours"
                    value={hours}
                    onChange={(e) => setHours(e.target.value.replace(/[^\d.]/g, ""))}
                    placeholder="Enter hours (e.g. 4)"
                    className="px-3 py-2"
                    inputMode="decimal"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("DRAWER_ADDRESS")}</Label>
            <SiteAddressPicker
              address={address}
              onAddressChange={setAddress}
              onLocationChange={setCoords}
              onPincodeChange={setPincode}
              placeholder={t("DRAWER_ADDRESS")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="drawer-pincode">{t("DRAWER_PINCODE")}</Label>
            <Input
              id="drawer-pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
              placeholder={t("DRAWER_PINCODE")}
              className="px-3 py-2"
              maxLength={6}
              inputMode="numeric"
            />
          </div>

          {duration > 0 && equipment && (
            <PriceSummary
              priceType={priceType}
              dailyRate={equipment.pricing.daily}
              hourlyRate={equipment.hourlyRate ?? equipment.pricing.hourly}
              duration={duration}
            />
          )}

          <Button
            className="w-full cursor-pointer rounded-full bg-[#F97316] font-bold text-white hover:bg-[#EA580C]"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {t("DRAWER_SUBMIT")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

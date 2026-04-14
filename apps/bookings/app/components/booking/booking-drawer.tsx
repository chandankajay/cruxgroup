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
  pricing: { daily: number };
}

interface BookingDrawerProps {
  readonly equipment: EquipmentForDrawer | null;
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (data: {
    equipmentId: string;
    address: string;
    pincode: string;
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
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");

  const today = useMemo(() => new Date(), []);

  const days = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return 0;
    return calculateDays(dateRange.from, dateRange.to);
  }, [dateRange]);

  useEffect(() => {
    if (!open) {
      setDateRange(undefined);
      setAddress("");
      setPincode("");
    }
  }, [open]);

  const canSubmit =
    equipment &&
    dateRange?.from &&
    dateRange?.to &&
    address.length > 0 &&
    pincode.length >= 4 &&
    !isSubmitting;

  function handleSubmit() {
    if (!canSubmit || !dateRange?.from || !dateRange?.to || !equipment) return;

    onSubmit({
      equipmentId: equipment.id,
      address,
      pincode,
      startDate: dateRange.from,
      endDate: dateRange.to,
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
          </div>

          <div className="space-y-2">
            <Label>{t("DRAWER_ADDRESS")}</Label>
            <SiteAddressPicker
              address={address}
              onAddressChange={setAddress}
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

          {days > 0 && equipment && (
            <PriceSummary dailyRate={equipment.pricing.daily} days={days} />
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

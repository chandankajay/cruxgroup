"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Dialog, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import {
  checkEquipmentAvailabilityAction,
  createQuickCustomerAction,
  createWalkInBookingAction,
  type WalkInEquipmentOption,
} from "../actions";
import { computeWalkInQuote, distanceJobToPartnerKm, partnerBaseCoords } from "../lib/walk-in-pricing";
import type { WalkInPrefill } from "../lib/parse-walk-in-prefill";
import { walkInBookingSchema, type WalkInBookingValues } from "../schema";

function fmtInr(n: number) {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

interface WalkInBookingFormProps {
  readonly customers: {
    id: string;
    name: string;
    company: string;
    phone: string;
    gstin: string | null;
  }[];
  readonly equipment: WalkInEquipmentOption[];
  readonly prefill?: WalkInPrefill | null;
}

export function WalkInBookingForm({
  customers: initialCustomers,
  equipment,
  prefill,
}: WalkInBookingFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [customers, setCustomers] = useState(initialCustomers);
  const [availability, setAvailability] = useState<"idle" | "ok" | "bad" | "checking">("idle");
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickName, setQuickName] = useState("");
  const [quickPhone, setQuickPhone] = useState("");
  const [quickGstin, setQuickGstin] = useState("");
  const [quickCompany, setQuickCompany] = useState("");
  const [quickBusy, setQuickBusy] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WalkInBookingValues>({
    resolver: zodResolver(walkInBookingSchema),
    defaultValues: {
      mode:
        prefill?.customerId && initialCustomers.some((c) => c.id === prefill.customerId)
          ? "existing"
          : initialCustomers.length > 0
            ? "existing"
            : "new",
      customerId:
        prefill?.customerId && initialCustomers.some((c) => c.id === prefill.customerId)
          ? prefill.customerId
          : initialCustomers[0]?.id ?? "",
      newName: "",
      newPhone: "",
      newCompany: "",
      newGstin: "",
      equipmentId:
        prefill?.equipmentId && equipment.some((e) => e.id === prefill.equipmentId)
          ? prefill.equipmentId
          : equipment[0]?.id ?? "",
      siteAddress: prefill?.siteAddress ?? "",
      pincode: prefill?.pincode ?? "",
      lat: prefill?.lat ?? 17.385,
      lng: prefill?.lng ?? 78.4867,
      pricingUnit: prefill?.pricingUnit ?? "hourly",
      duration: prefill?.duration ?? 8,
      startLocal: "",
      endLocal: "",
      expectedShift: prefill?.expectedShift ?? "DAY",
    },
  });

  const mode = watch("mode");
  const equipmentId = watch("equipmentId");
  const pricingUnit = watch("pricingUnit");
  const duration = watch("duration");
  const lat = watch("lat");
  const lng = watch("lng");
  const startLocal = watch("startLocal");
  const endLocal = watch("endLocal");

  const selectedEquipment = useMemo(
    () => equipment.find((e) => e.id === equipmentId),
    [equipment, equipmentId]
  );

  const quote = useMemo(() => {
    if (!selectedEquipment) return null;
    const base = partnerBaseCoords(selectedEquipment.partnerBaseLocation);
    const distanceKm = distanceJobToPartnerKm(
      { lat: Number(lat) || 0, lng: Number(lng) || 0 },
      base
    );
    return computeWalkInQuote({
      hourlyBase: selectedEquipment.hourlyBase,
      dailyBase: selectedEquipment.dailyBase,
      pricingUnit,
      duration: Number(duration) || 1,
      catalog: selectedEquipment.catalog,
      distanceKm,
    });
  }, [selectedEquipment, pricingUnit, duration, lat, lng]);

  const runAvailabilityCheck = useCallback(async () => {
    if (!equipmentId || !startLocal || !endLocal) {
      setAvailability("idle");
      return;
    }
    setAvailability("checking");
    const res = await checkEquipmentAvailabilityAction({
      equipmentId,
      startLocal,
      endLocal,
    });
    setAvailability(res.available ? "ok" : "bad");
    if (!res.available && res.error) {
      toast.error(res.error);
    }
  }, [equipmentId, startLocal, endLocal]);

  const onSubmit = (values: WalkInBookingValues) => {
    startTransition(async () => {
      const res = await createWalkInBookingAction(values);
      if (res.ok) {
        if (res.notifyFailed) {
          toast.success(
            "Booking created. WhatsApp notifications failed — check AiSensy configuration and logs."
          );
        } else {
          toast.success(
            "Walk-in booking created. Operator and customer notifications sent when templates are configured."
          );
        }
        router.push("/bookings");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  };

  async function onQuickAddCustomer() {
    if (!quickName.trim() || !quickPhone.trim()) {
      toast.error("Name and phone are required.");
      return;
    }
    setQuickBusy(true);
    const res = await createQuickCustomerAction({
      name: quickName,
      phone: quickPhone,
      company: quickCompany || undefined,
      gstin: quickGstin || undefined,
    });
    setQuickBusy(false);
    if (res.ok) {
      setCustomers((prev) => [
        ...prev,
        {
          id: res.id,
          name: quickName.trim(),
          company: quickCompany.trim(),
          phone: quickPhone.trim(),
          gstin: quickGstin.trim() || null,
        },
      ]);
      setValue("mode", "existing");
      setValue("customerId", res.id);
      setQuickOpen(false);
      setQuickName("");
      setQuickPhone("");
      setQuickGstin("");
      setQuickCompany("");
      toast.success("Customer added.");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl pb-16">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-charcoal">Walk-in booking desk</h1>
          <p className="text-sm text-muted-foreground">
            Dates/times are entered in IST; stored in UTC. Instant quote uses catalog min/max guardrails when linked.
          </p>
        </div>
        <Link
          href="/bookings"
          className="text-sm font-medium text-brand-orange underline-offset-4 hover:underline"
        >
          ← Back to bookings
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        <section className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal">Customer</h2>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                value="existing"
                {...register("mode")}
                className="accent-brand-orange"
              />
              Existing customer
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" value="new" {...register("mode")} className="accent-brand-orange" />
              New customer (on submit)
            </label>
          </div>

          {mode === "existing" ? (
            <div className="space-y-2">
              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-[min(100%,280px)] flex-1 space-y-1.5">
                  <Label htmlFor="customerId">Select customer</Label>
                  <select
                    id="customerId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register("customerId")}
                  >
                    <option value="">— Choose —</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                        {c.company ? ` (${c.company})` : ""} · {c.phone}
                      </option>
                    ))}
                  </select>
                  {errors.customerId ? (
                    <p className="text-sm text-destructive">{errors.customerId.message}</p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => setQuickOpen(true)}
                >
                  Quick add
                </Button>
                <Dialog open={quickOpen} onClose={() => setQuickOpen(false)}>
                  <DialogHeader>
                    <DialogTitle>Quick add customer</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="qname">Name</Label>
                      <Input
                        id="qname"
                        value={quickName}
                        onChange={(e) => setQuickName(e.target.value)}
                        placeholder="Company or person name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="qphone">Phone</Label>
                      <Input
                        id="qphone"
                        value={quickPhone}
                        onChange={(e) => setQuickPhone(e.target.value)}
                        placeholder="10-digit mobile"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="qcom">Company (optional)</Label>
                      <Input
                        id="qcom"
                        value={quickCompany}
                        onChange={(e) => setQuickCompany(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="qgstin">GSTIN (optional)</Label>
                      <Input
                        id="qgstin"
                        value={quickGstin}
                        onChange={(e) => setQuickGstin(e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      className="w-full"
                      disabled={quickBusy}
                      onClick={() => void onQuickAddCustomer()}
                    >
                      {quickBusy ? "Saving…" : "Save customer"}
                    </Button>
                  </div>
                </Dialog>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="newName">Name</Label>
                <Input id="newName" {...register("newName")} />
                {errors.newName ? (
                  <p className="text-sm text-destructive">{errors.newName.message}</p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPhone">Phone</Label>
                <Input id="newPhone" {...register("newPhone")} />
                {errors.newPhone ? (
                  <p className="text-sm text-destructive">{errors.newPhone.message}</p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newCompany">Company (optional)</Label>
                <Input id="newCompany" {...register("newCompany")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newGstin">GSTIN (optional)</Label>
                <Input id="newGstin" {...register("newGstin")} />
              </div>
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal">Machine & site</h2>
          <div className="space-y-1.5">
            <Label htmlFor="equipmentId">Equipment</Label>
            <select
              id="equipmentId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              {...register("equipmentId")}
            >
              {equipment.length === 0 ? (
                <option value="">No partner-linked equipment</option>
              ) : (
                equipment.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} · {e.category}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="siteAddress">Site address</Label>
            <Input id="siteAddress" {...register("siteAddress")} placeholder="Full site address" />
            {errors.siteAddress ? (
              <p className="text-sm text-destructive">{errors.siteAddress.message}</p>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" {...register("pincode")} />
              {errors.pincode ? (
                <p className="text-sm text-destructive">{errors.pincode.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lat">Latitude</Label>
              <Input id="lat" type="number" step="any" {...register("lat")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lng">Longitude</Label>
              <Input id="lng" type="number" step="any" {...register("lng")} />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal">Schedule (IST)</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="startLocal">Start</Label>
              <Input id="startLocal" type="datetime-local" {...register("startLocal")} />
              {errors.startLocal ? (
                <p className="text-sm text-destructive">{errors.startLocal.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endLocal">End</Label>
              <Input id="endLocal" type="datetime-local" {...register("endLocal")} />
              {errors.endLocal ? (
                <p className="text-sm text-destructive">{errors.endLocal.message}</p>
              ) : null}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="expectedShift">Expected shift</Label>
            <Input id="expectedShift" {...register("expectedShift")} placeholder="DAY / NIGHT / …" />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void runAvailabilityCheck()}
            disabled={!equipmentId || !startLocal || !endLocal}
          >
            {availability === "checking" ? "Checking…" : "Check machine availability"}
          </Button>
          {availability === "ok" ? (
            <p className="text-sm font-medium text-emerald-700">Slot looks available (no overlapping booking/trip).</p>
          ) : null}
          {availability === "bad" ? (
            <p className="text-sm font-medium text-destructive">Conflict detected — adjust window or machine.</p>
          ) : null}
        </section>

        <section className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal">Pricing</h2>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                value="hourly"
                {...register("pricingUnit")}
                className="accent-brand-orange"
              />
              Hourly
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" value="daily" {...register("pricingUnit")} className="accent-brand-orange" />
              Daily
            </label>
          </div>
          <div className="max-w-xs space-y-1.5">
            <Label htmlFor="duration">{pricingUnit === "hourly" ? "Billable hours" : "Billable days"}</Label>
            <Input
              id="duration"
              type="number"
              min={0.5}
              step={0.5}
              {...register("duration")}
            />
            {errors.duration ? (
              <p className="text-sm text-destructive">{errors.duration.message}</p>
            ) : null}
          </div>
          {quote ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm">
              <p className="font-medium text-charcoal">Quote preview</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>
                  Unit rate (after guardrails): <span className="font-mono text-charcoal">{fmtInr(quote.unitRateRupees)}</span>
                </li>
                <li>
                  Equipment subtotal: <span className="font-mono text-charcoal">{fmtInr(quote.equipmentSubtotalRupees)}</span>
                </li>
                <li>
                  Transport (beyond free zone):{" "}
                  <span className="font-mono text-charcoal">{fmtInr(quote.transportFeeRupees)}</span>
                </li>
                <li className="pt-2 text-base font-semibold text-charcoal">
                  Total: {fmtInr(quote.totalRupees)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    ({quote.totalPaise.toLocaleString("en-IN")} paise)
                  </span>
                </li>
              </ul>
            </div>
          ) : null}
        </section>

        <Button type="submit" className="min-h-12 w-full sm:w-auto" disabled={pending || equipment.length === 0}>
          {pending ? "Creating…" : "Create booking & trip"}
        </Button>
      </form>
    </div>
  );
}

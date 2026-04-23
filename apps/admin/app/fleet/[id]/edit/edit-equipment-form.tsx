"use client";

import { useMemo, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Select } from "@repo/ui/select";
import {
  buildEditFleetEquipmentSchema,
  type EditFleetEquipmentValues,
} from "./schema";
import {
  updatePartnerFleetEquipmentFromSession,
  type FleetEquipmentEditData,
} from "../../actions";

function fmtInr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="border-b border-border pb-2 text-sm font-semibold tracking-wide text-charcoal">
      {children}
    </h2>
  );
}

interface EditEquipmentFormProps {
  readonly initial: FleetEquipmentEditData;
}

export function EditEquipmentForm({ initial }: EditEquipmentFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const validationSchema = useMemo(
    () => buildEditFleetEquipmentSchema(initial.catalog),
    [initial.catalog]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditFleetEquipmentValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      hp: initial.hp,
      hourlyRate: initial.hourlyRate,
      dailyRate: initial.dailyRate,
      freeRadiusKm: initial.freeRadiusKm,
      transportRatePerKm: initial.transportRatePerKm,
      maxRadiusKm: initial.maxRadiusKm,
      minBookingHours: initial.minBookingHours,
      registrationNumber: initial.registrationNumber,
      operatorName: initial.operatorName,
      operatorPhone: initial.operatorPhone,
      manufacturingYear: initial.manufacturingYear,
      isActive: initial.isActive ? "true" : "false",
    },
  });

  const c = initial.catalog;

  function onSubmit(values: EditFleetEquipmentValues) {
    startTransition(async () => {
      const result = await updatePartnerFleetEquipmentFromSession({
        equipmentId: initial.id,
        hp: values.hp,
        hourlyRate: values.hourlyRate,
        dailyRate: values.dailyRate,
        freeRadiusKm: values.freeRadiusKm,
        transportRatePerKm: values.transportRatePerKm,
        maxRadiusKm: values.maxRadiusKm,
        minBookingHours: values.minBookingHours,
        registrationNumber: values.registrationNumber.trim(),
        operatorName: values.operatorName.trim(),
        operatorPhone: values.operatorPhone.trim(),
        manufacturingYear: values.manufacturingYear,
        isActive: values.isActive === "true",
      });
      if (result.success) {
        toast.success("Equipment updated.");
        router.replace("/fleet");
      } else {
        toast.error(result.error ?? "Could not save changes.");
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-2xl pb-16">
      <Link
        href="/fleet"
        className="mb-6 inline-block text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Back to My Fleet
      </Link>

      <div className="rounded-xl border border-border bg-white p-5 shadow-sm sm:p-8">
        <h1 className="text-xl font-bold text-charcoal sm:text-2xl">Edit equipment</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update rates, service radius, and operator details. Platform rate limits still apply
          {c ? " for this equipment type" : ""}.
        </p>

        <div className="mt-6 rounded-lg border border-border bg-muted/20 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type</p>
          <p className="mt-1 font-medium text-charcoal">{initial.name}</p>
          <p className="text-sm text-muted-foreground">{initial.categoryLabel}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-8">
          <div className="space-y-4">
            <SectionTitle>Machine</SectionTitle>
            <div className="space-y-2">
              <Label htmlFor="hp">Horsepower (HP)</Label>
              <Input
                id="hp"
                type="number"
                inputMode="numeric"
                min={0}
                {...register("hp")}
              />
              {errors.hp && <p className="text-xs text-destructive">{errors.hp.message}</p>}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration number</Label>
                <Input
                  id="registrationNumber"
                  placeholder="e.g. TS07 EA 1234"
                  autoCapitalize="characters"
                  {...register("registrationNumber")}
                />
                {errors.registrationNumber && (
                  <p className="text-xs text-destructive">
                    {errors.registrationNumber.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="manufacturingYear">Manufacturing year</Label>
                <Input
                  id="manufacturingYear"
                  type="number"
                  inputMode="numeric"
                  min={1980}
                  max={new Date().getFullYear() + 1}
                  {...register("manufacturingYear")}
                />
                {errors.manufacturingYear && (
                  <p className="text-xs text-destructive">
                    {errors.manufacturingYear.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <SectionTitle>Rates</SectionTitle>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly rate (₹)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  {...(c
                    ? { min: c.minHourlyRate / 100, max: c.maxHourlyRate / 100 }
                    : { min: 0 })}
                  {...register("hourlyRate")}
                />
                {c ? (
                  <p className="text-xs text-muted-foreground">
                    Platform limits: {fmtInr(c.minHourlyRate / 100)} – {fmtInr(c.maxHourlyRate / 100)}/hr
                  </p>
                ) : null}
                {errors.hourlyRate && (
                  <p className="text-xs text-destructive">{errors.hourlyRate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dailyRate">Daily rate (₹)</Label>
                <Input
                  id="dailyRate"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  {...(c
                    ? { min: c.minDailyRate / 100, max: c.maxDailyRate / 100 }
                    : { min: 0 })}
                  {...register("dailyRate")}
                />
                {c ? (
                  <p className="text-xs text-muted-foreground">
                    Platform limits: {fmtInr(c.minDailyRate / 100)} – {fmtInr(c.maxDailyRate / 100)}/day
                  </p>
                ) : null}
                {errors.dailyRate && (
                  <p className="text-xs text-destructive">{errors.dailyRate.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <SectionTitle>Logistics</SectionTitle>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="freeRadiusKm">Free delivery radius (km)</Label>
                <Input
                  id="freeRadiusKm"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  {...register("freeRadiusKm")}
                />
                {errors.freeRadiusKm && (
                  <p className="text-xs text-destructive">{errors.freeRadiusKm.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxRadiusKm">Max service radius (km)</Label>
                <Input
                  id="maxRadiusKm"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  {...register("maxRadiusKm")}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum crow‑flies distance you will send this machine for a job (same as “max
                  travel radius” on add equipment).
                </p>
                {errors.maxRadiusKm && (
                  <p className="text-xs text-destructive">{errors.maxRadiusKm.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="transportRatePerKm">Transport fee per extra km (₹)</Label>
                <Input
                  id="transportRatePerKm"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  {...register("transportRatePerKm")}
                />
                {errors.transportRatePerKm && (
                  <p className="text-xs text-destructive">
                    {errors.transportRatePerKm.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="minBookingHours">Minimum booking (hours)</Label>
                <Input
                  id="minBookingHours"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={168}
                  {...register("minBookingHours")}
                />
                {errors.minBookingHours && (
                  <p className="text-xs text-destructive">
                    {errors.minBookingHours.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <SectionTitle>Operator</SectionTitle>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="operatorName">Operator name</Label>
                <Input id="operatorName" placeholder="Full name" {...register("operatorName")} />
                {errors.operatorName && (
                  <p className="text-xs text-destructive">{errors.operatorName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="operatorPhone">Operator phone</Label>
                <Input
                  id="operatorPhone"
                  type="tel"
                  inputMode="tel"
                  placeholder="10+ digit mobile"
                  {...register("operatorPhone")}
                />
                {errors.operatorPhone && (
                  <p className="text-xs text-destructive">{errors.operatorPhone.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <SectionTitle>Availability</SectionTitle>
            <div className="space-y-2">
              <Label htmlFor="isActive">Status</Label>
              <Select id="isActive" {...register("isActive")}>
                <option value="true">Available for hire</option>
                <option value="false">Unavailable (maintenance / off-hire)</option>
              </Select>
              {errors.isActive && (
                <p className="text-xs text-destructive">{errors.isActive.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Link
              href="/fleet"
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </Link>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
import type { MasterCatalogFormRow } from "../catalog-types";
import { submitAddFleetEquipmentFromSession } from "../actions";
import {
  buildAddFleetEquipmentSchema,
  type AddFleetEquipmentValues,
} from "./schema";

function fmtInr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

const defaultYear = new Date().getFullYear() - 3;

interface AddEquipmentFormProps {
  readonly catalog: MasterCatalogFormRow[];
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="border-b border-border pb-2 text-sm font-semibold tracking-wide text-charcoal">
      {children}
    </h2>
  );
}

export function AddEquipmentForm({ catalog }: AddEquipmentFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const catalogEmpty = catalog.length === 0;

  const validationSchema = useMemo(
    () => buildAddFleetEquipmentSchema(catalog),
    [catalog]
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AddFleetEquipmentValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      catalogId: "",
      hp: 0,
      hourlyRate: 0,
      dailyRate: 0,
      freeRadiusKm: 5,
      transportRatePerKm: 0,
      maxRadiusKm: 50,
      minBookingHours: 4,
      registrationNumber: "",
      operatorName: "",
      operatorPhone: "",
      manufacturingYear: defaultYear,
      isActive: "true",
    },
  });

  const catalogId = watch("catalogId");
  const selected = useMemo(
    () => catalog.find((r) => r.id === catalogId),
    [catalog, catalogId]
  );

  const specEntries = useMemo(() => {
    const raw = selected?.specifications;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
    return Object.entries(raw as Record<string, unknown>);
  }, [selected]);

  function onSubmit(values: AddFleetEquipmentValues) {
    startTransition(async () => {
      const result = await submitAddFleetEquipmentFromSession(values);
      if (result.success) {
        toast.success("Equipment added to your fleet.");
        // Replace avoids stacking /fleet on history; revalidatePath runs in the server action.
        // Do not call router.refresh() here — it targets the *current* route (/fleet/new) and can block navigation.
        router.replace("/fleet");
      } else {
        toast.error(result.error ?? "Could not save equipment.");
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
        <h1 className="text-xl font-bold text-charcoal sm:text-2xl">
          Add equipment
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Register a machine for rent. Rates must stay within platform limits for
          the selected type.
        </p>

        {catalogEmpty && (
          <div
            className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
            role="alert"
          >
            <p className="font-medium">Equipment type list is empty.</p>
            <p className="mt-1 text-amber-900/90">
              Run <code className="rounded bg-white/90 px-1.5 py-0.5 text-xs">prisma db push</code> then{" "}
              <code className="rounded bg-white/90 px-1.5 py-0.5 text-xs">prisma db seed</code> so{" "}
              <code className="rounded bg-white/90 px-1.5 py-0.5 text-xs">master_catalog</code> has rows.
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-8"
        >
          <div className="space-y-4">
            <SectionTitle>Type</SectionTitle>
            <div className="space-y-2">
              <Label htmlFor="catalogId">Equipment type</Label>
              <Select
                id="catalogId"
                disabled={catalogEmpty}
                {...register("catalogId")}
              >
                <option value="">Select type</option>
                {catalog.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                  </option>
                ))}
              </Select>
              {errors.catalogId && (
                <p className="text-xs text-destructive">{errors.catalogId.message}</p>
              )}
            </div>

            {selected && selected.imageUrl ? (
              <div className="overflow-hidden rounded-lg border border-border bg-muted/20">
                <img
                  src={selected.imageUrl}
                  alt=""
                  className="h-40 w-full object-cover"
                />
              </div>
            ) : null}

            {specEntries.length > 0 ? (
              <div className="rounded-lg border border-border bg-gray-50/80 px-4 py-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Catalog specifications
                </p>
                <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  {specEntries.map(([key, value]) => (
                    <div key={key} className="min-w-0">
                      <dt className="text-muted-foreground">{key}</dt>
                      <dd className="font-medium text-charcoal">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </div>

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
              {errors.hp && (
                <p className="text-xs text-destructive">{errors.hp.message}</p>
              )}
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
                  {...(selected
                    ? {
                        min: selected.minHourlyRate / 100,
                        max: selected.maxHourlyRate / 100,
                      }
                    : { min: 0 })}
                  {...register("hourlyRate")}
                />
                {selected ? (
                  <p className="text-xs text-muted-foreground">
                    Platform limits: {fmtInr(selected.minHourlyRate / 100)} –{" "}
                    {fmtInr(selected.maxHourlyRate / 100)}/hr
                  </p>
                ) : null}
                {errors.hourlyRate && (
                  <p className="text-xs text-destructive">
                    {errors.hourlyRate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dailyRate">Daily rate (₹)</Label>
                <Input
                  id="dailyRate"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  {...(selected
                    ? {
                        min: selected.minDailyRate / 100,
                        max: selected.maxDailyRate / 100,
                      }
                    : { min: 0 })}
                  {...register("dailyRate")}
                />
                {selected ? (
                  <p className="text-xs text-muted-foreground">
                    Platform limits: {fmtInr(selected.minDailyRate / 100)} –{" "}
                    {fmtInr(selected.maxDailyRate / 100)}/day
                  </p>
                ) : null}
                {errors.dailyRate && (
                  <p className="text-xs text-destructive">
                    {errors.dailyRate.message}
                  </p>
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
                  <p className="text-xs text-destructive">
                    {errors.freeRadiusKm.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxRadiusKm">Max travel radius (km)</Label>
                <Input
                  id="maxRadiusKm"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  {...register("maxRadiusKm")}
                />
                <p className="text-xs text-muted-foreground">
                  Furthest distance you will send this machine for a job.
                </p>
                {errors.maxRadiusKm && (
                  <p className="text-xs text-destructive">
                    {errors.maxRadiusKm.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="transportRatePerKm">
                  Transport fee per extra km (₹)
                </Label>
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
                <Input
                  id="operatorName"
                  placeholder="Full name"
                  {...register("operatorName")}
                />
                {errors.operatorName && (
                  <p className="text-xs text-destructive">
                    {errors.operatorName.message}
                  </p>
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
                  <p className="text-xs text-destructive">
                    {errors.operatorPhone.message}
                  </p>
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
            <Button type="submit" disabled={pending || catalogEmpty}>
              {pending ? "Saving…" : "Add to fleet"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

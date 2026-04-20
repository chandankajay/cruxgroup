"use client";

import Link from "next/link";
import type { CustomerDetailData, CustomerBookingTimelineItem } from "../../actions";

function fmtInrFromPaise(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatWhen(d: Date): string {
  return new Date(d).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function buildBookAgainHref(
  customerId: string,
  b: CustomerBookingTimelineItem
): string {
  const p = new URLSearchParams();
  p.set("customerId", customerId);
  p.set("equipmentId", b.equipment.id);
  p.set("siteAddress", b.location.address);
  p.set("pincode", b.location.pincode);
  p.set("lat", String(b.location.coordinates.lat));
  p.set("lng", String(b.location.coordinates.lng));
  p.set("pricingUnit", b.pricing.unit === "daily" ? "daily" : "hourly");
  p.set("duration", String(b.pricing.duration));
  const shift = b.expectedShift?.trim();
  if (shift) p.set("expectedShift", shift);
  return `/bookings/new?${p.toString()}`;
}

interface CustomerDetailContentProps {
  readonly data: CustomerDetailData;
}

export function CustomerDetailContent({ data }: CustomerDetailContentProps) {
  const overCredit =
    data.creditLimit > 0 && data.outstandingPaise > data.creditLimit;
  const latest = data.bookings[0];

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-charcoal">{data.name}</h1>
          <p className="text-muted-foreground">{data.company || "—"}</p>
          <p className="mt-2 font-mono text-sm">{data.phone}</p>
          {data.gstin ? (
            <p className="mt-1 text-sm text-muted-foreground">GSTIN: {data.gstin}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {latest ? (
            <Link
              href={buildBookAgainHref(data.id, latest)}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-brand-orange-dark"
            >
              Book again
            </Link>
          ) : null}
          <Link
            href="/customers"
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-accent"
          >
            ← All customers
          </Link>
        </div>
      </div>

      <section className="grid gap-4 rounded-xl border border-border bg-white p-6 shadow-sm sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Outstanding
          </p>
          <p
            className={`mt-1 text-xl font-semibold tabular-nums ${overCredit ? "text-red-700" : "text-charcoal"}`}
          >
            {fmtInrFromPaise(data.outstandingPaise)}
          </p>
          {overCredit ? (
            <p className="mt-2 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-800">
              Exceeds credit limit ({fmtInrFromPaise(data.creditLimit)})
            </p>
          ) : null}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Credit limit
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-charcoal">
            {data.creditLimit > 0 ? fmtInrFromPaise(data.creditLimit) : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Bookings
          </p>
          <p className="mt-1 text-xl font-semibold text-charcoal">{data.bookings.length}</p>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-charcoal">Booking history</h2>
        {data.bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No bookings linked to this customer yet.</p>
        ) : (
          <ol className="relative space-y-6 border-l-2 border-border pl-6">
            {data.bookings.map((b) => (
              <li key={b.id} className="relative">
                <span className="absolute -left-[calc(0.5rem+5px)] top-1.5 h-3 w-3 rounded-full border-2 border-brand-orange bg-white" />
                <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-charcoal">
                        {b.equipment.category} · {b.equipment.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Booking #{b.id.slice(-8).toUpperCase()} · {b.status}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Requested {formatWhen(b.createdAt)}
                      </p>
                      {b.startDate && b.endDate ? (
                        <p className="text-sm text-muted-foreground">
                          Window: {formatWhen(b.startDate)} → {formatWhen(b.endDate)}
                        </p>
                      ) : null}
                      <p className="mt-1 text-sm">{b.location.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-charcoal">
                        ₹{(b.pricing.total / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {b.pricing.duration} {b.pricing.unit}
                      </p>
                      <Link
                        href={buildBookAgainHref(data.id, b)}
                        className="mt-2 inline-block text-sm font-medium text-brand-orange underline-offset-4 hover:underline"
                      >
                        Book again with this job
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

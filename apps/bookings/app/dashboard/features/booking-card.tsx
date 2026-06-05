import Link from "next/link";
import type { MyBookingCardData, TripStatus } from "../data";

function statusBadgeClass(status: MyBookingCardData["status"]): string {
  switch (status) {
    case "PENDING":
    case "PENDING_PARTNER":
      return "bg-amber-100 text-amber-900 ring-amber-400/35";
    case "PARTNER_ACCEPTED":
      return "bg-emerald-100 text-emerald-900 ring-emerald-500/30";
    case "PARTNER_DECLINED":
      return "bg-red-100 text-red-900 ring-red-400/30";
    case "CONFIRMED":
      return "bg-sky-100 text-sky-900 ring-sky-500/30";
    case "DISPATCHED":
      return "bg-violet-100 text-violet-900 ring-violet-500/30";
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-900 ring-emerald-500/30";
    case "CANCELLED":
      return "bg-zinc-200 text-zinc-800 ring-zinc-400/25";
    default:
      return "bg-zinc-100 text-zinc-800 ring-zinc-400/20";
  }
}

function statusLabel(status: MyBookingCardData["status"]): string {
  switch (status) {
    case "PENDING_PARTNER":
      return "Awaiting partner";
    case "PARTNER_ACCEPTED":
      return "Partner accepted";
    case "PARTNER_DECLINED":
      return "Partner declined";
    case "DISPATCHED":
      return "Dispatched";
    default:
      return status.charAt(0) + status.slice(1).toLowerCase();
  }
}

function tripStatusBadgeClass(status: TripStatus): string {
  switch (status) {
    case "SCHEDULED":
      return "bg-blue-50 text-blue-800 ring-blue-300/40";
    case "ENROUTE":
      return "bg-orange-50 text-orange-800 ring-orange-300/40";
    case "ON_SITE":
      return "bg-green-50 text-green-800 ring-green-400/40";
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-800 ring-emerald-400/40";
    case "OVERRUN":
      return "bg-red-50 text-red-800 ring-red-300/40";
    case "CANCELLED":
      return "bg-zinc-100 text-zinc-700 ring-zinc-300/30";
    case "DISPUTED":
      return "bg-rose-50 text-rose-800 ring-rose-300/40";
    default:
      return "bg-zinc-100 text-zinc-700 ring-zinc-300/30";
  }
}

function tripStatusLabel(status: TripStatus): string {
  switch (status) {
    case "ENROUTE":
      return "En Route";
    case "ON_SITE":
      return "On Site";
    default:
      return status.charAt(0) + status.slice(1).toLowerCase();
  }
}

export function BookingCard({ booking }: { readonly booking: MyBookingCardData }) {
  return (
    <article
      className="rounded-2xl border border-brand-navy/10 bg-white p-4 shadow-sm sm:p-5"
      aria-labelledby={`booking-title-${booking.id}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <h2
            id={`booking-title-${booking.id}`}
            className="truncate text-base font-bold tracking-tight text-brand-navy sm:text-lg"
          >
            {booking.equipmentName}
          </h2>
          <p className="text-sm text-brand-navy/70">{booking.dateLabel}</p>
          {booking.yardLabel ? (
            <p className="text-sm font-medium text-brand-navy/85">
              <span className="text-brand-navy/55">Partner / yard</span>{" "}
              {booking.yardLabel}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-row items-center gap-3 sm:flex-col sm:items-end">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ring-1 ring-inset ${statusBadgeClass(booking.status)}`}
          >
            {statusLabel(booking.status)}
          </span>
          <p className="text-lg font-extrabold tabular-nums text-brand-navy sm:text-xl">
            {booking.totalInrLabel}
          </p>
        </div>
      </div>

      {booking.tripStatus && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-brand-navy/8 bg-slate-50/80 px-3 py-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${tripStatusBadgeClass(booking.tripStatus)}`}
          >
            {tripStatusLabel(booking.tripStatus)}
          </span>
          <span className="text-xs text-brand-navy/60">Trip status</span>
          {booking.trackUrl && (
            <Link
              href={booking.trackUrl}
              className="ml-auto text-xs font-semibold text-[#d45800] hover:underline"
            >
              Track →
            </Link>
          )}
        </div>
      )}

      {booking.invoices.length > 0 ? (
        <ul className="mt-4 space-y-1 border-t border-brand-navy/10 pt-3 text-xs text-brand-navy/70">
          {booking.invoices.map((inv) => (
            <li key={`${booking.id}-${inv.invoiceNumber}`} className="flex flex-wrap justify-between gap-2">
              <span className="font-medium">Invoice {inv.invoiceNumber}</span>
              <span>
                {inv.amountInrLabel} · {inv.paymentStatus.replaceAll("_", " ")}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

import type { MyBookingCardData } from "../data";

function statusBadgeClass(status: MyBookingCardData["status"]): string {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-900 ring-amber-400/35";
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
    case "DISPATCHED":
      return "Dispatched";
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

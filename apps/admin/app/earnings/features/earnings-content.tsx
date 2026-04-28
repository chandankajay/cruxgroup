"use client";

import { useMemo } from "react";
import type { PartnerBookingRow } from "../../my-bookings/actions";

interface EarningsContentProps {
  readonly bookings: PartnerBookingRow[];
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function inrPaise(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-5 py-5 shadow-sm ${
        accent ? "border-amber-200 bg-amber-50" : "border-border bg-card"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1.5 text-2xl font-bold ${
          accent ? "text-amber-700" : "text-charcoal"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
      )}
    </div>
  );
}

export function EarningsContent({ bookings }: EarningsContentProps) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const stats = useMemo(() => {
    const completed = bookings.filter((b) => b.status === "COMPLETED");
    const totalEarned = completed.reduce((s, b) => s + b.pricing.total, 0);

    const thisMonthEarned = completed
      .filter((b) => {
        const d = b.createdAt ? new Date(b.createdAt) : null;
        return (
          d && d.getMonth() === currentMonth && d.getFullYear() === currentYear
        );
      })
      .reduce((s, b) => s + b.pricing.total, 0);

    const pending = bookings
      .filter((b) => b.status === "PENDING" || b.status === "CONFIRMED")
      .reduce((s, b) => s + b.pricing.total, 0);

    const avgBookingValue =
      completed.length > 0 ? totalEarned / completed.length : 0;

    // Monthly breakdown for the last 6 months
    const monthly: { month: string; earned: number; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();

      const monthBookings = completed.filter((b) => {
        const bd = b.createdAt ? new Date(b.createdAt) : null;
        return bd && bd.getMonth() === m && bd.getFullYear() === y;
      });

      monthly.push({
        month: `${MONTHS[m]} ${y !== currentYear ? y : ""}`.trim(),
        earned: monthBookings.reduce((s, b) => s + b.pricing.total, 0),
        count: monthBookings.length,
      });
    }

    return { totalEarned, thisMonthEarned, pending, avgBookingValue, monthly };
  }, [bookings, currentMonth, currentYear]);

  const maxBar = Math.max(...stats.monthly.map((m) => m.earned), 1);

  return (
    <div>
      <div className="mb-6">
        <h1 className="select-none text-2xl font-semibold tracking-tight text-charcoal">Earnings</h1>
        <p className="mt-1 text-sm text-zinc-600 lg:text-muted-foreground">
          Revenue summary from completed bookings.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Earned"
          value={inrPaise(stats.totalEarned)}
          sub="All completed bookings"
          accent
        />
        <StatCard
          label="This Month"
          value={inrPaise(stats.thisMonthEarned)}
          sub={MONTHS[currentMonth]}
        />
        <StatCard
          label="Pipeline"
          value={inrPaise(stats.pending)}
          sub="Pending + Confirmed"
        />
        <StatCard
          label="Avg. Booking Value"
          value={inrPaise(Math.round(stats.avgBookingValue))}
          sub="Per completed job"
        />
      </div>

      {/* Monthly bar chart */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-5 text-base font-semibold text-charcoal">
          Monthly Earnings (Last 6 Months)
        </h2>

        {stats.monthly.every((m) => m.earned === 0) ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No completed bookings yet. Revenue will appear here once jobs are
            marked as completed.
          </p>
        ) : (
          <div className="flex items-end gap-3">
            {stats.monthly.map((m) => {
              const heightPct = (m.earned / maxBar) * 100;
              return (
                <div
                  key={m.month}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  {m.earned > 0 && (
                    <span className="text-xs font-semibold text-amber-700">
                      {inrPaise(m.earned)}
                    </span>
                  )}
                  <div
                    className="w-full rounded-t-md bg-amber-400 transition-all"
                    style={{ height: `${Math.max(heightPct, 4)}px`, minHeight: "4px", maxHeight: "180px" }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {m.month}
                  </span>
                  {m.count > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      {m.count} job{m.count !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent completed bookings */}
      {bookings.filter((b) => b.status === "COMPLETED").length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-semibold text-charcoal">Recent Completed Jobs</h2>
          </div>
          <div className="divide-y divide-border">
            {bookings
              .filter((b) => b.status === "COMPLETED")
              .slice(0, 5)
              .map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-charcoal">
                      {b.equipment.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {b.user.name || "Guest"} ·{" "}
                      {b.createdAt
                        ? new Date(b.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })
                        : "—"}
                    </p>
                  </div>
                  <span className="font-bold text-amber-700">
                    {inrPaise(b.pricing.total)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

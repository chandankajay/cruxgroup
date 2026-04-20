"use client";

import { useState, useCallback, useTransition, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@repo/ui/table";
import { StatusBadge } from "../../bookings/features/status-badge";
import { BookingActionsMenu } from "../../bookings/features/booking-actions-menu";
import { SiteDetailModal } from "../../bookings/features/site-detail-modal";
import { updatePartnerBookingStatusAction } from "../actions";
import type { PartnerBookingRow } from "../actions";
import type { BookingStatus } from "@repo/api";

function formatDate(d: Date | string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
      className={`rounded-xl border px-5 py-4 ${
        accent
          ? "border-amber-200 bg-amber-50"
          : "border-border bg-white"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-bold ${
          accent ? "text-amber-700" : "text-charcoal"
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

interface MyBookingsContentProps {
  readonly initialData: PartnerBookingRow[];
}

export function MyBookingsContent({ initialData }: MyBookingsContentProps) {
  const [bookings, setBookings] = useState<PartnerBookingRow[]>(initialData);
  const [selectedBooking, setSelectedBooking] =
    useState<PartnerBookingRow | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const stats = useMemo(() => {
    const total = bookings.reduce((s, b) => s + b.pricing.total, 0);
    const completed = bookings.filter((b) => b.status === "COMPLETED");
    const earned = completed.reduce((s, b) => s + b.pricing.total, 0);
    const pending = bookings.filter((b) => b.status === "PENDING").length;
    return { total, earned, pending, count: bookings.length };
  }, [bookings]);

  const handleStatusChange = useCallback(
    (id: string, status: BookingStatus) => {
      setUpdatingId(id);
      startTransition(async () => {
        const result = await updatePartnerBookingStatusAction(id, status);
        if (result.success) {
          setBookings((prev) =>
            prev.map((b) => (b.id === id ? { ...b, status } : b))
          );
        }
        setUpdatingId(null);
      });
    },
    []
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="select-none text-2xl font-semibold tracking-tight text-charcoal">My Bookings</h1>
        <p className="mt-1 text-sm text-zinc-600 lg:text-muted-foreground">
          Rental requests for your fleet equipment.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Bookings"
          value={stats.count.toString()}
        />
        <StatCard
          label="Pending"
          value={stats.pending.toString()}
          sub="Awaiting action"
        />
        <StatCard
          label="Revenue Earned"
          value={`₹${stats.earned.toLocaleString("en-IN")}`}
          sub="From completed"
          accent
        />
        <StatCard
          label="Total Pipeline"
          value={`₹${stats.total.toLocaleString("en-IN")}`}
          sub="All bookings"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        {bookings.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">
              No bookings yet. Make sure your equipment is listed and your
              service area is configured.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-charcoal/5">
                <TableHead>Customer</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow
                  key={booking.id}
                  style={{ opacity: updatingId === booking.id ? 0.5 : 1 }}
                  className="min-h-14 touch-manipulation py-3 transition-colors active:bg-slate-100 lg:hover:bg-slate-50"
                >
                  <TableCell>
                    <p className="font-semibold text-charcoal">
                      {booking.user.name || "Guest"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.user.phoneNumber ?? "—"}
                    </p>
                  </TableCell>

                  <TableCell>
                    <p className="font-medium text-charcoal">
                      {booking.equipment.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.equipment.category}
                    </p>
                  </TableCell>

                  <TableCell>
                    <p className="text-sm text-charcoal">
                      {formatDate(booking.startDate)} →{" "}
                      {formatDate(booking.endDate)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.pricing.duration}{" "}
                      {booking.pricing.unit === "hourly" ? "hr" : "day"}
                      {booking.pricing.duration !== 1 ? "s" : ""}
                    </p>
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="font-bold text-brand-orange">
                      ₹{booking.pricing.total.toLocaleString("en-IN")}
                    </span>
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={booking.status as BookingStatus} />
                  </TableCell>

                  <TableCell className="text-right">
                    <BookingActionsMenu
                      bookingId={booking.id}
                      currentStatus={booking.status as BookingStatus}
                      onViewSite={() => setSelectedBooking(booking)}
                      onStatusChange={handleStatusChange}
                      isUpdating={isPending && updatingId === booking.id}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <SiteDetailModal
        booking={selectedBooking as Parameters<typeof SiteDetailModal>[0]["booking"]}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  );
}

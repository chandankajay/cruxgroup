"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@repo/ui/table";
import { StatusBadge } from "./status-badge";
import { BookingActionsMenu } from "./booking-actions-menu";
import type { BookingRow } from "../actions";
import type { BookingStatus } from "@repo/api";

interface BookingsTableProps {
  readonly bookings: BookingRow[];
  readonly updatingId: string | null;
  readonly onViewSite: (booking: BookingRow) => void;
  readonly onStatusChange: (id: string, status: BookingStatus) => void;
}

function formatDate(d: Date | string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateRange(
  start: Date | string | null,
  end: Date | string | null,
  duration: number
): string {
  if (start && end) {
    return `${formatDate(start)} → ${formatDate(end)}`;
  }
  return `${duration} day${duration !== 1 ? "s" : ""}`;
}

export function BookingsTable({
  bookings,
  updatingId,
  onViewSite,
  onStatusChange,
}: BookingsTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        No rental requests yet.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-charcoal/5">
          <TableHead className="text-xs font-semibold uppercase tracking-wide text-charcoal">
            Customer
          </TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wide text-charcoal">
            Equipment
          </TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wide text-charcoal">
            Dates
          </TableHead>
          <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-charcoal">
            Total
          </TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wide text-charcoal">
            Status
          </TableHead>
          <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-charcoal">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow
            key={booking.id}
            className="transition-colors hover:bg-slate-50"
            style={{ opacity: updatingId === booking.id ? 0.5 : 1 }}
          >
            {/* Customer */}
            <TableCell>
              <p className="font-semibold text-charcoal">
                {booking.user.name ?? "Guest"}
              </p>
              <p className="text-xs text-muted-foreground">
                {booking.user.phoneNumber ?? "—"}
              </p>
            </TableCell>

            {/* Equipment */}
            <TableCell>
              <p className="font-medium text-charcoal">
                {booking.equipment.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {booking.equipment.category}
              </p>
            </TableCell>

            {/* Dates */}
            <TableCell>
              <p className="text-sm text-charcoal">
                {formatDateRange(
                  booking.startDate,
                  booking.endDate,
                  booking.pricing.duration
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {booking.pricing.duration} day
                {booking.pricing.duration !== 1 ? "s" : ""}
              </p>
            </TableCell>

            {/* Total */}
            <TableCell className="text-right">
              <span className="font-bold text-brand-orange">
                ₹{(booking.pricing.total / 100).toLocaleString("en-IN")}
              </span>
            </TableCell>

            {/* Status */}
            <TableCell>
              <StatusBadge status={booking.status as BookingStatus} />
            </TableCell>

            {/* Actions */}
            <TableCell className="text-right">
              <BookingActionsMenu
                bookingId={booking.id}
                currentStatus={booking.status as BookingStatus}
                onViewSite={() => onViewSite(booking)}
                onStatusChange={onStatusChange}
                isUpdating={updatingId === booking.id}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

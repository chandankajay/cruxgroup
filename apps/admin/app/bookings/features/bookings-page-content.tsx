"use client";

import { useState, useTransition, useCallback } from "react";
import { BookingsTable } from "./bookings-table";
import { SiteDetailModal } from "./site-detail-modal";
import { updateBookingStatusAction } from "../actions";
import type { BookingRow } from "../actions";
import type { BookingStatus } from "@repo/api";

interface BookingsPageContentProps {
  readonly initialData: BookingRow[];
}

const STATUS_COUNTS: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "DISPATCHED",
  "COMPLETED",
  "CANCELLED",
];

export function BookingsPageContent({ initialData }: BookingsPageContentProps) {
  const [bookings, setBookings] = useState<BookingRow[]>(initialData);
  const [selectedBooking, setSelectedBooking] = useState<BookingRow | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;

  const handleStatusChange = useCallback(
    (id: string, status: BookingStatus) => {
      setUpdatingId(id);

      startTransition(async () => {
        const result = await updateBookingStatusAction(id, status);

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

  const handleViewSite = useCallback((booking: BookingRow) => {
    setSelectedBooking(booking);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedBooking(null);
  }, []);

  return (
    <>
      {/* Page Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Rental Requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and update all incoming equipment booking requests
          </p>
        </div>
        {pendingCount > 0 && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              borderRadius: 9999,
              backgroundColor: "#FFF7ED",
              color: "#C2410C",
              fontSize: "0.8125rem",
              fontWeight: 600,
            }}
          >
            ● {pendingCount} Pending
          </span>
        )}
      </div>

      {/* Status Summary Strip */}
      <div className="mb-6 flex flex-wrap gap-3">
        {STATUS_COUNTS.map((status) => {
          const count = bookings.filter((b) => b.status === status).length;
          return (
            <div
              key={status}
              className="flex items-center gap-2 rounded-lg bg-card px-4 py-2 shadow-sm"
            >
              <span className="text-xs font-medium text-muted-foreground capitalize">
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </span>
              <span className="text-base font-bold text-charcoal">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-xl bg-card shadow-sm">
        <BookingsTable
          bookings={bookings}
          updatingId={isPending ? updatingId : null}
          onViewSite={handleViewSite}
          onStatusChange={handleStatusChange}
        />
      </div>

      {/* Site Detail Modal */}
      <SiteDetailModal booking={selectedBooking} onClose={handleCloseModal} />
    </>
  );
}

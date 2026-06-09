"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@repo/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { StatusBadge } from "../../bookings/features/status-badge";
import { BookingActionsMenu } from "../../bookings/features/booking-actions-menu";
import { SiteDetailModal } from "../../bookings/features/site-detail-modal";
import { updatePartnerBookingStatusAction } from "../actions";
import type { PartnerBookingRow } from "../actions";
import type { BookingStatus } from "@repo/api";

const REQUEST_STATUSES = new Set<BookingStatus>(["PENDING", "PENDING_PARTNER"]);
const ACTIVE_STATUSES = new Set<BookingStatus>([
  "PARTNER_ACCEPTED",
  "CONFIRMED",
  "DISPATCHED",
]);
const COMPLETED_STATUSES = new Set<BookingStatus>(["COMPLETED"]);

type BookingsTab = "requests" | "active" | "completed";

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
        accent ? "border-amber-200 bg-amber-50" : "border-border bg-card"
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

function filterByTab(bookings: PartnerBookingRow[], tab: BookingsTab): PartnerBookingRow[] {
  if (tab === "requests") {
    return bookings.filter((b) => REQUEST_STATUSES.has(b.status as BookingStatus));
  }
  if (tab === "active") {
    return bookings.filter((b) => ACTIVE_STATUSES.has(b.status as BookingStatus));
  }
  return bookings.filter((b) => COMPLETED_STATUSES.has(b.status as BookingStatus));
}

export function MyBookingsContent({ initialData }: MyBookingsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const defaultTab: BookingsTab =
    initialTab === "active" || initialTab === "completed" ? initialTab : "requests";

  const [bookings, setBookings] = useState<PartnerBookingRow[]>(initialData);
  const [tab, setTab] = useState<BookingsTab>(defaultTab);
  const [selectedBooking, setSelectedBooking] = useState<PartnerBookingRow | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const stats = useMemo(() => {
    const total = bookings.reduce((s, b) => s + b.pricing.total, 0);
    const completed = bookings.filter((b) => b.status === "COMPLETED");
    const earned = completed.reduce((s, b) => s + b.pricing.total, 0);
    const pending = bookings.filter((b) => REQUEST_STATUSES.has(b.status as BookingStatus)).length;
    return { total, earned, pending, count: bookings.length };
  }, [bookings]);

  const tabCounts = useMemo(
    () => ({
      requests: filterByTab(bookings, "requests").length,
      active: filterByTab(bookings, "active").length,
      completed: filterByTab(bookings, "completed").length,
    }),
    [bookings]
  );

  const visibleBookings = useMemo(() => filterByTab(bookings, tab), [bookings, tab]);

  const handleTabChange = (value: string) => {
    const next = value as BookingsTab;
    setTab(next);
    router.replace(`/my-bookings?tab=${next}`, { scroll: false });
  };

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

  const emptyMessage =
    tab === "requests"
      ? "No inbound requests right now. Make sure your equipment is listed and your service area is configured."
      : tab === "active"
        ? "No active bookings. Accept inbound requests to see live jobs here."
        : "No completed bookings yet.";

  return (
    <div>
      <div className="mb-6">
        <h1 className="select-none text-2xl font-semibold tracking-tight text-charcoal">Bookings</h1>
        <p className="mt-1 text-sm text-zinc-600 lg:text-muted-foreground">
          Inbound requests, active jobs, and completed rentals for your fleet.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Bookings" value={stats.count.toString()} />
        <StatCard label="Pending requests" value={stats.pending.toString()} sub="Awaiting action" />
        <StatCard
          label="Revenue Earned"
          value={`₹${(stats.earned / 100).toLocaleString("en-IN")}`}
          sub="From completed"
          accent
        />
        <StatCard
          label="Total Pipeline"
          value={`₹${(stats.total / 100).toLocaleString("en-IN")}`}
          sub="All bookings"
        />
      </div>

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="requests">Requests ({tabCounts.requests})</TabsTrigger>
          <TabsTrigger value="active">Active ({tabCounts.active})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({tabCounts.completed})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {visibleBookings.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-muted-foreground">{emptyMessage}</p>
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
                  {visibleBookings.map((booking) => (
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
                        <p className="font-medium text-charcoal">{booking.equipment.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.equipment.category}
                        </p>
                      </TableCell>

                      <TableCell>
                        <p className="text-sm text-charcoal">
                          {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {booking.pricing.duration}{" "}
                          {booking.pricing.unit === "hourly" ? "hr" : "day"}
                          {booking.pricing.duration !== 1 ? "s" : ""}
                        </p>
                      </TableCell>

                      <TableCell className="text-right">
                        <span className="font-bold text-brand-orange">
                          ₹{(booking.pricing.total / 100).toLocaleString("en-IN")}
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
        </TabsContent>
      </Tabs>

      <SiteDetailModal
        booking={selectedBooking as Parameters<typeof SiteDetailModal>[0]["booking"]}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  );
}

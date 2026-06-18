import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "../../../lib/auth";
import { fetchBookingDetailForCustomer } from "./data";
import { BookingProgressPoller } from "./booking-progress-poller";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function BookingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login");
  }

  const booking = await fetchBookingDetailForCustomer(id, userId);
  if (!booking) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-[60vh] max-w-lg px-4 py-8 sm:max-w-xl sm:px-6 sm:py-10">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-brand-navy/70 underline-offset-2 hover:underline"
        >
          ← My bookings
        </Link>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">
          {booking.equipmentName}
        </h1>
        <p className="mt-1.5 text-sm text-brand-navy/65">
          {booking.dateLabel} · {booking.totalInrLabel}
        </p>
      </div>

      <BookingProgressPoller
        bookingId={booking.id}
        initial={{
          progressStage: booking.progressStage,
          bookingStatus: booking.status,
          progressHistory: booking.progressHistory,
        }}
      />
    </main>
  );
}

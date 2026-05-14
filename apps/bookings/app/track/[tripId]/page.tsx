import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "../../../lib/auth";
import { fetchTripForCustomer } from "./data";
import { LiveTripTracking } from "./live-trip-tracking";

type PageProps = {
  params: Promise<{ tripId: string }>;
};

export default async function TrackTripPage({ params }: PageProps) {
  const { tripId } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login");
  }

  const trip = await fetchTripForCustomer(tripId, userId);
  if (!trip) {
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
          Trip status
        </h1>
        <p className="mt-1.5 text-sm text-brand-navy/65">
          Follow your job from dispatch to completion.
        </p>
      </div>

      <LiveTripTracking trip={trip} />
    </main>
  );
}

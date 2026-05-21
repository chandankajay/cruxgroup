import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../lib/auth";
import { fetchMyBookingsForUser } from "./data";
import { MyBookingsDashboard } from "./features/my-bookings-dashboard";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login");
  }

  const { active, past } = await fetchMyBookingsForUser(userId);

  return (
    <main className="mx-auto min-h-[60vh] max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/"
            className="text-sm font-semibold text-brand-navy/70 underline-offset-2 hover:underline"
          >
            ← Back to fleet
          </Link>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">
            My bookings
          </h1>
          <p className="mt-1.5 text-sm text-brand-navy/65">
            Active jobs, upcoming hires, and your rental history.
          </p>
        </div>
      </div>
      <MyBookingsDashboard active={active} past={past} />
    </main>
  );
}

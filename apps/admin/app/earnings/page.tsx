import { auth } from "../../lib/auth";
import { redirect } from "next/navigation";
import { fetchPartnerBookings } from "../my-bookings/actions";
import { EarningsContent } from "./features/earnings-content";

export const dynamic = "force-dynamic";

export default async function EarningsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/login");

  const bookings = await fetchPartnerBookings(userId);

  return <EarningsContent bookings={bookings} />;
}

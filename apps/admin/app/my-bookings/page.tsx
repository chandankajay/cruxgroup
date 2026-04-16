import { auth } from "../../lib/auth";
import { redirect } from "next/navigation";
import { fetchPartnerBookings } from "./actions";
import { MyBookingsContent } from "./features/my-bookings-content";

export const dynamic = "force-dynamic";

export default async function MyBookingsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/login");

  const bookings = await fetchPartnerBookings(userId);

  return <MyBookingsContent initialData={bookings} />;
}

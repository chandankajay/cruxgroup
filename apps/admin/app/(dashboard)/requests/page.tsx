import { auth } from "../../../lib/auth";
import { redirect } from "next/navigation";
import { fetchPartnerBookings } from "../../my-bookings/actions";
import { MyBookingsContent } from "../../my-bookings/features/my-bookings-content";

export const dynamic = "force-dynamic";

/**
 * Partner inbound requests (B2C → B2B). Only listings within the partner’s
 * `maxServiceRadiusKm` of `baseCoordinates` are returned for PENDING jobs
 * (see `listBookingsByPartner` in `@repo/api`).
 */
export default async function PartnerInboundRequestsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/login");

  const bookings = await fetchPartnerBookings(userId);

  return <MyBookingsContent initialData={bookings} />;
}

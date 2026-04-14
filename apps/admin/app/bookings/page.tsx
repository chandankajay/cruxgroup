import { fetchBookings } from "./actions";
import { BookingsPageContent } from "./features/bookings-page-content";

export default async function BookingsPage() {
  const bookings = await fetchBookings();

  return <BookingsPageContent initialData={bookings} />;
}

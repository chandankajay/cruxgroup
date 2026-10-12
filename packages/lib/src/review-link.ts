/** Customer review / ratings page on the bookings app. */
export function bookingsAppOrigin(): string {
  const raw =
    process.env["NEXT_PUBLIC_BOOKINGS_URL"]?.trim() ||
    process.env["BOOKINGS_APP_URL"]?.trim() ||
    "https://bookings.cruxgroup.in";
  return raw.replace(/\/$/, "");
}

export function buildCustomerReviewLink(reviewToken: string): string {
  const token = reviewToken.trim();
  return `${bookingsAppOrigin()}/review/${encodeURIComponent(token)}`;
}

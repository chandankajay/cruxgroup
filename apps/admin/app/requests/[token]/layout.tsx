import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking Request | Crux Group",
  description: "Review and respond to a new booking request",
};

/** Minimal layout — no admin chrome; page is public (token-authenticated). */
export default function BookingResponseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

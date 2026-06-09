import { redirect } from "next/navigation";

/** Legacy route — consolidated into `/my-bookings?tab=requests`. */
export default function PartnerInboundRequestsRedirectPage() {
  redirect("/my-bookings?tab=requests");
}

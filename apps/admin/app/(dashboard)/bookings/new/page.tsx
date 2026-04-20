import { redirect } from "next/navigation";
import { fetchWalkInDeskData } from "./actions";
import { WalkInBookingForm } from "./features/walk-in-booking-form";
import { parseWalkInPrefill } from "./lib/parse-walk-in-prefill";

export const dynamic = "force-dynamic";

export default async function WalkInBookingNewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const data = await fetchWalkInDeskData();
  if (!data.ok) {
    redirect("/dashboard");
  }

  const sp = await searchParams;
  const prefill = parseWalkInPrefill(sp);

  return (
    <WalkInBookingForm
      customers={data.customers}
      equipment={data.equipment}
      prefill={prefill}
    />
  );
}

import { redirect } from "next/navigation";
import {
  fetchWalkInDeskData,
  loadWalkInReschedulePayload,
  type WalkInReschedulePayloadOk,
} from "./actions";
import { WalkInBookingForm } from "./features/walk-in-booking-form";
import { parseWalkInPrefill } from "./lib/parse-walk-in-prefill";

export const dynamic = "force-dynamic";

function firstBookingId(
  sp: Record<string, string | string[] | undefined>
): string | undefined {
  const raw = sp["bookingId"];
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (Array.isArray(raw) && typeof raw[0] === "string" && raw[0].trim()) return raw[0].trim();
  return undefined;
}

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
  const bookingId = firstBookingId(sp);

  let reschedule: WalkInReschedulePayloadOk | null = null;
  let rescheduleLoadError: string | null = null;

  if (bookingId) {
    const loaded = await loadWalkInReschedulePayload(bookingId);
    if (loaded.ok) reschedule = loaded.data;
    else rescheduleLoadError = loaded.error;
  }

  const prefill = reschedule ? undefined : parseWalkInPrefill(sp);

  return (
    <WalkInBookingForm
      customers={data.customers}
      equipment={data.equipment}
      prefill={prefill}
      reschedule={reschedule}
      rescheduleLoadError={rescheduleLoadError}
    />
  );
}

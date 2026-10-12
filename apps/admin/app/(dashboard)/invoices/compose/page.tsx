import { redirect } from "next/navigation";
import { fetchComposerTripPicker } from "./actions";
import { InvoiceComposerClient } from "./features/invoice-composer-client";

export const dynamic = "force-dynamic";

export default async function InvoiceComposePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const trips = await fetchComposerTripPicker();
  if (trips === null) redirect("/dashboard");

  const sp = await searchParams;
  const raw = sp["tripId"];
  const initialTripId = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;

  return <InvoiceComposerClient trips={trips} initialTripId={initialTripId} />;
}

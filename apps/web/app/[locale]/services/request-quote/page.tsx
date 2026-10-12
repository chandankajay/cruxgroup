import type { Metadata } from "next";
import { listQuoteVillageOptions } from "@repo/lib/quote-villages";
import { QuoteRequestForm } from "./quote-form";

export const metadata: Metadata = {
  title: "Request a site visit & quote — Crux Group Services",
  description:
    "Request a free site visit and quotation for land levelling, earthworks, compound fencing and more within 50 km of Kothur.",
  robots: { index: true, follow: true },
};

export default function RequestQuotePage() {
  const villages = listQuoteVillageOptions();
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-12">
      <QuoteRequestForm villages={villages} />
    </main>
  );
}

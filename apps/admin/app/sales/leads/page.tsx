import { redirect } from "next/navigation";
import type { LeadStatus, LeadType } from "@prisma/client";
import { fetchMyLeads } from "../actions";
import { LeadsPageContent } from "../features/leads-page-content";

export const dynamic = "force-dynamic";

export default async function SalesLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    leadType?: string;
    search?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const status = sp.status as LeadStatus | undefined;
  const leadType = sp.leadType as LeadType | undefined;
  const search = sp.search;
  const page = sp.page ? Number(sp.page) : 1;

  const data = await fetchMyLeads({ status, leadType, search, page });
  if (!data) redirect("/login");

  return (
    <LeadsPageContent
      initialItems={data.items}
      initialTotal={data.total}
      initialStatus={status}
      initialLeadType={leadType}
      initialSearch={search}
    />
  );
}

import { notFound, redirect } from "next/navigation";
import { fetchLeadDetail } from "../../actions";
import { LeadDetailContent } from "../../features/lead-detail-content";
import { ServiceLeadDetailContent } from "../../features/service-lead-detail-content";

export const dynamic = "force-dynamic";

export default async function SalesLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await fetchLeadDetail(id);
  if (lead === null) redirect("/login");
  if (!lead) notFound();

  if (lead.leadType === "SERVICE") {
    return <ServiceLeadDetailContent lead={lead} />;
  }

  return <LeadDetailContent lead={lead} />;
}

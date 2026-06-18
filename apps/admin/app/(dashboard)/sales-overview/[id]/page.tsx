import { notFound, redirect } from "next/navigation";
import {
  fetchSalesPersonAdmin,
  fetchSalesPersonLeadsAdmin,
} from "../../../sales/actions";
import { SalesPersonLeadsContent } from "../features/sales-person-leads-content";

export const dynamic = "force-dynamic";

export default async function SalesPersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [salesPerson, leads] = await Promise.all([
    fetchSalesPersonAdmin(id),
    fetchSalesPersonLeadsAdmin(id),
  ]);

  if (leads === null) redirect("/login");
  if (!salesPerson) notFound();

  return <SalesPersonLeadsContent salesPerson={salesPerson} leads={leads} />;
}

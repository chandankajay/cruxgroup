import { redirect } from "next/navigation";
import {
  fetchAssignableSalespeople,
  fetchServiceLeadsBoard,
} from "./actions";
import { ServicesLeadsBoard } from "./features/services-leads-board";
import { ServicesLeadsList } from "./features/services-leads-list";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  view?: string;
  area?: string;
  service?: string;
  sales?: string;
  q?: string;
}>;

export default async function ServicesLeadsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const filters = {
    area: sp.area,
    serviceSlug: sp.service,
    salesPersonId: sp.sales,
    search: sp.q,
  };

  const [board, salespeople] = await Promise.all([
    fetchServiceLeadsBoard(filters),
    fetchAssignableSalespeople(),
  ]);

  if (!board || !salespeople) redirect("/login");

  if (sp.view === "list") {
    const flat = Object.values(board).flat();
    return (
      <ServicesLeadsList
        leads={flat}
        salespeople={salespeople}
        filters={filters}
      />
    );
  }

  return (
    <ServicesLeadsBoard board={board} salespeople={salespeople} filters={filters} />
  );
}

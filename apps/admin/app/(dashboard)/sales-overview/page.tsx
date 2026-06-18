import { redirect } from "next/navigation";
import { fetchSalesOverview } from "../../sales/actions";
import { SalesOverviewContent } from "./features/sales-overview-content";

export const dynamic = "force-dynamic";

export default async function SalesOverviewPage() {
  const salesPeople = await fetchSalesOverview();
  if (!salesPeople) redirect("/login");

  return <SalesOverviewContent salesPeople={salesPeople} />;
}

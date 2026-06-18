import { redirect } from "next/navigation";
import { fetchSalesStats } from "./actions";
import { SalesPerformanceContent } from "./features/sales-performance-content";

export const dynamic = "force-dynamic";

export default async function SalesHomePage() {
  const stats = await fetchSalesStats();
  if (!stats) redirect("/login");

  return <SalesPerformanceContent stats={stats} />;
}

import { redirect } from "next/navigation";
import { fetchSalespeople } from "./actions";
import { SalespeopleList } from "./features/salespeople-list";

export const dynamic = "force-dynamic";

export default async function SalespeoplePage() {
  const salespeople = await fetchSalespeople();
  if (!salespeople) redirect("/login");
  return <SalespeopleList salespeople={salespeople} />;
}

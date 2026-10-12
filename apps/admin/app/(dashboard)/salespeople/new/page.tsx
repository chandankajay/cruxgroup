import { redirect } from "next/navigation";
import { requireAdminSession } from "../../../lib/sales-auth";
import { SalespersonForm } from "../features/salesperson-form";

export const dynamic = "force-dynamic";

export default async function NewSalespersonPage() {
  const admin = await requireAdminSession();
  if (!admin) redirect("/login");
  return <SalespersonForm mode="create" />;
}

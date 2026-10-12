import { notFound, redirect } from "next/navigation";
import { requireAdminSession } from "../../../../../lib/sales-auth";
import { fetchSalespersonById } from "../../actions";
import { SalespersonForm } from "../../features/salesperson-form";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditSalespersonPage({ params }: Props) {
  const admin = await requireAdminSession();
  if (!admin) redirect("/login");
  const { id } = await params;
  const salesperson = await fetchSalespersonById(id);
  if (!salesperson) notFound();
  return <SalespersonForm mode="edit" initial={salesperson} />;
}

import { notFound, redirect } from "next/navigation";
import { fetchCustomerDetail } from "../actions";
import { CustomerDetailContent } from "./features/customer-detail-content";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await fetchCustomerDetail(id);
  if (data === "unauthorized") {
    redirect("/dashboard");
  }
  if (data === "not_found") {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl pb-16">
      <CustomerDetailContent data={data} />
    </div>
  );
}

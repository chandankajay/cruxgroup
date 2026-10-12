import { redirect } from "next/navigation";
import { fetchAdminWalkInDeskData, fetchPartnerFleetOptions } from "./actions";
import { AdminWalkInForm } from "./features/admin-walk-in-form";

export const dynamic = "force-dynamic";

export default async function AdminWalkInPage() {
  const data = await fetchAdminWalkInDeskData();
  if (!data.ok) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-charcoal">Walk-in booking</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Super Admin desk — pick partner, fleet row, and direct assign or partner request.
        </p>
      </header>
      <AdminWalkInForm
        partners={data.partners}
        customers={data.customers}
        loadFleet={fetchPartnerFleetOptions}
      />
    </div>
  );
}

import { redirect } from "next/navigation";
import { fetchCrmCustomers } from "./actions";
import { CustomersPageContent } from "./features/customers-page-content";

export const dynamic = "force-dynamic";

export default async function CustomersCrmPage() {
  const rows = await fetchCrmCustomers();
  if (rows === null) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-6xl pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-charcoal">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Outstanding balance sums unpaid and partially paid invoice amounts (after completed
          payments). Credit limit is in INR; compared in paise internally.
        </p>
      </div>
      <CustomersPageContent rows={rows} />
    </div>
  );
}

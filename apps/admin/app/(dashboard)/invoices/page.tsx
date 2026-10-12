import { redirect } from "next/navigation";
import { fetchInvoiceOutbox } from "./actions";
import { SendInvoicesClient } from "./features/send-invoices-client";

export const dynamic = "force-dynamic";

export default async function SendInvoicesPage() {
  const rows = await fetchInvoiceOutbox();
  if (rows === null) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-7xl pb-16">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
        <h1 className="text-2xl font-semibold tracking-tight text-charcoal">Send invoices</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Discovery list for completed jobs. Compose and send bills from the manual composer.
        </p>
        </div>
        <a
          href="/invoices/compose"
          className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Create / send invoice
        </a>
      </div>
      <SendInvoicesClient rows={rows} />
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchMachineHealthPageData } from "./actions";
import { MachineHealthClient } from "./features/machine-health-client";

export const dynamic = "force-dynamic";

export default async function MachineHealthPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await fetchMachineHealthPageData(id);
  if (!data) notFound();

  const serialized = JSON.parse(JSON.stringify(data)) as typeof data;

  return (
    <div className="mx-auto max-w-4xl pb-16">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link
          href="/equipment"
          className="text-sm font-medium text-brand-orange hover:underline"
        >
          ← All equipment
        </Link>
      </div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-charcoal">
          Machine health — {data.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hour meter, breakdowns, repair costs (paise), and preventive service alerts to partners.
        </p>
      </div>
      <MachineHealthClient initialData={serialized} equipmentId={id} />
    </div>
  );
}

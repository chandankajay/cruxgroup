import { auth } from "../../lib/auth";
import { redirect } from "next/navigation";
import { fetchFleet } from "./actions";
import { FleetPageContent } from "./features/fleet-page-content";

export const dynamic = "force-dynamic";

export default async function FleetPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/login");

  const fleet = await fetchFleet(userId);

  return (
    <FleetPageContent initialData={fleet.items} partnerKycStatus={fleet.partnerKycStatus} />
  );
}

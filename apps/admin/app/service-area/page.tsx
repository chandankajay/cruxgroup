import { auth } from "../../lib/auth";
import { redirect } from "next/navigation";
import { createCaller } from "@repo/api";
import { ServiceAreaSelfContent } from "./features/service-area-self-content";

export const dynamic = "force-dynamic";

async function getMyPartnerData(userId: string) {
  try {
    const caller = createCaller({});
    return await caller.partner.byId({ id: userId });
  } catch {
    return null;
  }
}

export default async function ServiceAreaPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/login");

  const partnerData = await getMyPartnerData(userId);

  return (
    <ServiceAreaSelfContent
      partnerId={userId}
      partnerName={session?.user?.name ?? "Partner"}
      initialLocation={
        partnerData?.location?.coordinates?.length === 2
          ? {
              lat: partnerData.location.coordinates[1],
              lng: partnerData.location.coordinates[0],
            }
          : null
      }
      initialRadius={partnerData?.maxServiceRadius ?? 10}
      initialBaseAddress={partnerData?.baseAddress ?? ""}
    />
  );
}

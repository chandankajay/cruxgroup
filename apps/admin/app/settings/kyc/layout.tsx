import { redirectPartnerWithoutProfile } from "../../lib/require-partner-profile";

export const dynamic = "force-dynamic";

export default async function PartnerKycLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await redirectPartnerWithoutProfile();
  return children;
}

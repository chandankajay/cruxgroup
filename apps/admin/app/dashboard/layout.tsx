import { redirectPartnerWithoutProfile } from "../lib/require-partner-profile";

export const dynamic = "force-dynamic";

/**
 * Partner onboarding gate: dashboard requires a profile and accepted terms.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await redirectPartnerWithoutProfile();
  return children;
}

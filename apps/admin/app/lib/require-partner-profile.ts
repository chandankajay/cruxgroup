import { redirectPartnerIncompleteOnboarding } from "./require-partner-onboarding";

/**
 * If the signed-in user is a PARTNER without a completed onboarding (profile + terms),
 * redirect to `/onboarding`. Call from route layouts that must not run until done.
 */
export async function redirectPartnerWithoutProfile(): Promise<void> {
  await redirectPartnerIncompleteOnboarding();
}

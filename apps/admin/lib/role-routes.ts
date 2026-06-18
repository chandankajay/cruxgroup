/** First-login role picker for phone OTP users (`User.role === USER`). */
export const CHOOSE_ROLE_PATH = "/choose-role";

export const SALES_HOME = "/sales";

export function isChooseRolePath(pathname: string): boolean {
  return pathname === CHOOSE_ROLE_PATH;
}

export function isSalesPath(pathname: string): boolean {
  return pathname === SALES_HOME || pathname.startsWith(`${SALES_HOME}/`);
}

export function homePathForRole(role: string): string {
  if (role === "PARTNER") return "/fleet";
  if (role === "SALES") return SALES_HOME;
  if (role === "USER") return CHOOSE_ROLE_PATH;
  return "/dashboard";
}

/** Phone OTP users awaiting Partner vs Sales selection. */
export function needsAdminRoleSelection(role: string): boolean {
  return role === "USER";
}

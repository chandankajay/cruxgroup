/**
 * Sales permission helpers — safe to import from server actions and tests.
 */

export type SalesUserPermissions = {
  canSendQuotes: boolean;
  isActive: boolean;
};

export function canMarkQuotationSent(
  role: string,
  permissions: SalesUserPermissions,
): boolean {
  if (role === "ADMIN") return true;
  if (role !== "SALES") return false;
  if (!permissions.isActive) return false;
  return permissions.canSendQuotes;
}

export function assertSalesRoleSelectable(role: "PARTNER" | "SALES"): "PARTNER" {
  if (role === "SALES") {
    throw new Error("SALES role cannot be self-selected.");
  }
  return "PARTNER";
}

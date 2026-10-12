import { canMarkQuotationSent, type SalesUserPermissions } from "@repo/lib";
import { auth } from "./auth";

export type SalesSession = {
  userId: string;
  name: string;
  phoneNumber: string | null;
  canSendQuotes: boolean;
  isActive: boolean;
};

export async function requireSalesSession(): Promise<SalesSession | null> {
  const session = await auth();
  const userId = session?.user?.id;
  const role = session?.user?.role;
  if (!userId || role !== "SALES") return null;

  const permissions: SalesUserPermissions = {
    canSendQuotes: session.user.canSendQuotes === true,
    isActive: session.user.isActive !== false,
  };
  if (!permissions.isActive) return null;

  return {
    userId,
    name: session.user.name ?? "",
    phoneNumber: session.user.phoneNumber ?? null,
    canSendQuotes: permissions.canSendQuotes,
    isActive: permissions.isActive,
  };
}

export async function requireAdminSession(): Promise<{
  userId: string;
  canSendQuotes: boolean;
} | null> {
  const session = await auth();
  const userId = session?.user?.id;
  const role = session?.user?.role;
  if (!userId || role !== "ADMIN") return null;
  return { userId, canSendQuotes: true };
}

/** Whether the current session may record a quotation sent on a service lead. */
export async function sessionCanSendQuotes(): Promise<boolean> {
  const session = await auth();
  const role = session?.user?.role ?? "";
  const permissions: SalesUserPermissions = {
    canSendQuotes: session?.user?.canSendQuotes === true,
    isActive: session?.user?.isActive !== false,
  };
  return canMarkQuotationSent(role, permissions);
}

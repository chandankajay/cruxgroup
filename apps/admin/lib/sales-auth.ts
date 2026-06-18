import { auth } from "./auth";

export type SalesSession = {
  userId: string;
  name: string;
  phoneNumber: string | null;
};

export async function requireSalesSession(): Promise<SalesSession | null> {
  const session = await auth();
  const userId = session?.user?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!userId || role !== "SALES") return null;
  return {
    userId,
    name: session.user.name ?? "",
    phoneNumber:
      (session.user as { phoneNumber?: string | null }).phoneNumber ?? null,
  };
}

export async function requireAdminSession(): Promise<{ userId: string } | null> {
  const session = await auth();
  const userId = session?.user?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!userId || role !== "ADMIN") return null;
  return { userId };
}

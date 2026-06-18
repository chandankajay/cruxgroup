import { redirect } from "next/navigation";
import { auth } from "../../lib/auth";
import { homePathForRole, needsAdminRoleSelection } from "../../lib/role-routes";
import { RoleSelectionCard } from "./role-selection-card";

export const dynamic = "force-dynamic";

export default async function ChooseRolePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role ?? "USER";
  if (!needsAdminRoleSelection(role)) {
    redirect(homePathForRole(role));
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <RoleSelectionCard />
    </div>
  );
}

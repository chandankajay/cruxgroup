import { redirect } from "next/navigation";
import { requireAdminSession } from "../../../../../lib/sales-auth";
import { ProjectForm } from "../features/project-form";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  if (!(await requireAdminSession())) redirect("/login");
  return <ProjectForm mode="create" />;
}

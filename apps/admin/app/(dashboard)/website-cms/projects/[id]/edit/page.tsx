import { notFound, redirect } from "next/navigation";
import { requireAdminSession } from "../../../../../../lib/sales-auth";
import { fetchProjectById } from "../../actions";
import { ProjectForm } from "../../features/project-form";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditProjectPage({ params }: Props) {
  if (!(await requireAdminSession())) redirect("/login");
  const { id } = await params;
  const project = await fetchProjectById(id);
  if (!project) notFound();
  return <ProjectForm mode="edit" initial={project} />;
}

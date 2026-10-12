import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@repo/ui/button";
import { fetchProjects } from "./actions";

export const dynamic = "force-dynamic";

export default async function CmsProjectsPage() {
  const projects = await fetchProjects();
  if (!projects) redirect("/login");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Service projects & case studies</h1>
          <p className="text-sm text-muted-foreground">
            Upload photos to Vercel Blob via the project form. Published projects appear on service
            spoke pages.
          </p>
        </div>
        <Button asChild>
          <Link href="/website-cms/projects/new">Add project</Link>
        </Button>
      </div>
      <ul className="divide-y rounded-xl border">
        {projects.map((p) => (
          <li key={p.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium">{p.title}</p>
              <p className="text-xs text-muted-foreground">
                {p.serviceSlug} · {p.villageLabel ?? p.areaSlug ?? "—"}
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/website-cms/projects/${p.id}/edit`}>Edit</Link>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

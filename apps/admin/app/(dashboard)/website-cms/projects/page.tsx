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
        <Link
          href="/website-cms/projects/new"
          className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Add project
        </Link>
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
            <Link
              href={`/website-cms/projects/${p.id}/edit`}
              className="text-sm text-amber-600 hover:underline"
            >
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

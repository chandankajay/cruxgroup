import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@repo/db";
import { requireAdminResourceAuthz } from "../../../../lib/resource-authz";
import { deleteBlogPostFromForm } from "../actions";
import { BlogPublishedToggle } from "./blog-published-toggle";

export const dynamic = "force-dynamic";

export default async function WebsiteBlogListPage(): Promise<React.ReactElement> {
  const ctx = await requireAdminResourceAuthz();
  if (!ctx) redirect("/login");

  const posts = await prisma.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Blog posts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Draft and publish posts for the public website.
          </p>
        </div>
        <Link
          href="/website-cms/blog/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          New post
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Published</th>
              <th className="px-4 py-3 font-medium">Tags</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{p.title_en}</td>
                <td className="px-4 py-3">
                  {p.published ? (
                    <span className="text-green-600">Published</span>
                  ) : (
                    <span className="text-muted-foreground">Draft</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <BlogPublishedToggle id={p.id} initial={p.published} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {p.tags.join(", ")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/website-cms/blog/${p.id}/edit`}
                      className="text-primary hover:underline"
                    >
                      Edit
                    </Link>
                    <form action={deleteBlogPostFromForm}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className="text-destructive hover:underline"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

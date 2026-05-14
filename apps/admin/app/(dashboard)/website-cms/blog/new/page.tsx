import { redirect } from "next/navigation";
import { requireAdminResourceAuthz } from "../../../../../lib/resource-authz";
import { BlogPostForm } from "../blog-post-form";

export const dynamic = "force-dynamic";

export default async function NewBlogPostPage(): Promise<React.ReactElement> {
  const ctx = await requireAdminResourceAuthz();
  if (!ctx) redirect("/login");

  return <BlogPostForm mode="new" />;
}

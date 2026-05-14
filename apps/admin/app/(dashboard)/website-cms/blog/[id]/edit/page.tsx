import { notFound, redirect } from "next/navigation";
import { prisma } from "@repo/db";
import { requireAdminResourceAuthz } from "../../../../../../lib/resource-authz";
import { BlogPostForm } from "../../blog-post-form";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactElement> {
  const ctx = await requireAdminResourceAuthz();
  if (!ctx) redirect("/login");

  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return <BlogPostForm mode="edit" initial={post} />;
}

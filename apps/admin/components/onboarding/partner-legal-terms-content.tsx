import { MDXRemote } from "next-mdx-remote/rsc";
import { readPartnerTermsMarkdown } from "@repo/lib/legal/partner-terms";

export async function PartnerLegalTermsContent() {
  const source = await readPartnerTermsMarkdown();

  return (
    <div className="prose-crux max-w-none text-sm text-foreground">
      <MDXRemote source={source} />
    </div>
  );
}

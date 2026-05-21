import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { LegalMarkdown } from "../../components/legal-markdown";

export const metadata: Metadata = {
  title: "Partner Terms of Service | CruxGroup",
  description:
    "B2B Terms of Service for equipment owners using the CruxGroup Partner OS and marketplace.",
};

function loadPartnerTermsMarkdown(): string {
  const filePath = path.join(
    process.cwd(),
    "content",
    "legal",
    "partner-terms-of-service.md"
  );
  return fs.readFileSync(filePath, "utf8");
}

export default function PartnerTermsPage() {
  const markdown = loadPartnerTermsMarkdown();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
      <p className="mb-6 text-xs leading-relaxed text-muted-foreground">
        This document is a template for your legal team. It does not constitute legal
        advice. Have qualified Indian counsel review before publication.
      </p>

      <div className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border pb-6 text-sm">
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
        <span className="text-muted-foreground" aria-hidden>
          ·
        </span>
        <Link
          href="/settings/kyc"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Trust Center (KYC)
        </Link>
        <span className="text-muted-foreground" aria-hidden>
          ·
        </span>
        <Link
          href="/legal/privacy-policy"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Privacy Policy
        </Link>
      </div>

      <LegalMarkdown content={markdown} />
    </div>
  );
}

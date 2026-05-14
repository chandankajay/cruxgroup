import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { LegalMarkdown } from "../../components/legal-markdown";

export const metadata: Metadata = {
  title: "Privacy Policy | CruxGroup",
  description:
    "How CruxGroup collects, uses, and protects personal data across the Bookings app and Partner OS.",
};

function loadPrivacyPolicyMarkdown(): string {
  const filePath = path.join(process.cwd(), "content", "legal", "privacy-policy.md");
  return fs.readFileSync(filePath, "utf8");
}

export default function PrivacyPolicyPage() {
  const markdown = loadPrivacyPolicyMarkdown();

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
          href="/legal/partner-terms"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Partner Terms
        </Link>
        <span className="text-muted-foreground" aria-hidden>
          ·
        </span>
        <Link
          href="/settings/kyc"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Trust Center
        </Link>
      </div>

      <LegalMarkdown content={markdown} />
    </div>
  );
}

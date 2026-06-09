import Link from "next/link";
import { SectionWrapper } from "../ui/SectionWrapper";
import { USE_CASES } from "../../lib/seo/data/use-cases";
import type { Locale } from "../../lib/locale";

function firstSentence(text: string): string {
  const match = text.match(/^[^.!?]+[.!?]/);
  return match ? match[0] : text;
}

export function ContractorUseCases({ locale }: { readonly locale: Locale }) {
  const allSearchTerms = USE_CASES.flatMap((u) => u.searchTerms);

  return (
    <SectionWrapper id="contractor-use-cases">
      <h2 className="text-center text-3xl font-bold text-offwhite md:text-4xl">
        {locale === "te"
          ? "Contractors Em Book Chestunnadi"
          : "What Contractors Book Us For"}
      </h2>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {USE_CASES.map((uc) => (
          <Link
            key={uc.slug}
            href={`/${locale}/equipment/${uc.equipment[0]}`}
            className="flex flex-col rounded-xl border border-border bg-surface p-5 transition-colors hover:border-brand/40"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-offwhite">
                {locale === "te" ? uc.displayName_te : uc.displayName}
              </h3>
              {uc.isPartnerService ? (
                <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">
                  Partner Service
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {firstSentence(
                locale === "te" && uc.description_te
                  ? uc.description_te
                  : uc.description,
              )}
            </p>
            <span className="mt-3 inline-block w-fit rounded-full border border-border px-2 py-0.5 text-xs capitalize text-muted">
              {uc.equipment[0]}
            </span>
          </Link>
        ))}
      </div>

      <ul aria-hidden className="sr-only">
        {allSearchTerms.map((term) => (
          <li key={term}>{term}</li>
        ))}
      </ul>
    </SectionWrapper>
  );
}

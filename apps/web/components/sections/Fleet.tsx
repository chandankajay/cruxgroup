"use client";

import type { SiteBlock } from "@prisma/client";
import Link from "next/link";
import { AnimateOnScroll } from "../ui/AnimateOnScroll";
import { BillingText } from "../ui/BillingText";
import { SectionWrapper } from "../ui/SectionWrapper";
import { useLang } from "../ui/LanguageProvider";
import { equipmentSlugFromHeading } from "../../lib/seo/equipment-slugs";
import { FleetIcon } from "./FleetIcon";

function FleetCard({
  block,
  index,
}: {
  readonly block: SiteBlock;
  readonly index: number;
}): React.ReactElement {
  const { lang } = useLang();
  const slug = equipmentSlugFromHeading(block.heading_en);
  const href = slug ? `/${lang}/equipment/${slug}` : undefined;

  const inner = (
    <>
      <FleetIcon
        name={block.icon}
        className="size-9 text-brand transition-transform group-hover:scale-110"
      />
      <h3 className="mt-3 text-lg font-semibold text-offwhite">
        <BillingText
          en={block.heading_en ?? ""}
          te={block.heading_te ?? block.heading_en}
        />
      </h3>
      <p className="mt-2 text-sm text-muted">
        <BillingText
          en={block.body_en ?? ""}
          te={block.body_te ?? block.body_en}
        />
      </p>
      {href ? (
        <p className="mt-3 text-xs font-medium text-brand group-hover:text-accent">
          View details →
        </p>
      ) : null}
    </>
  );

  return (
    <AnimateOnScroll animation="scaleIn" delay={index * 60}>
      {href ? (
        <Link
          href={href}
          className="group flex h-full flex-col rounded-xl border border-border bg-surface/80 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand/50 hover:shadow-[0_12px_40px_rgba(212,88,0,0.12)]"
        >
          {inner}
        </Link>
      ) : (
        <article className="group flex h-full flex-col rounded-xl border border-border bg-surface/80 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand/50 hover:shadow-[0_12px_40px_rgba(212,88,0,0.12)]">
          {inner}
        </article>
      )}
    </AnimateOnScroll>
  );
}

export function Fleet({
  heading,
  sub,
  blocks,
}: {
  readonly heading: { readonly en: string; readonly te?: string | null };
  readonly sub: { readonly en: string; readonly te?: string | null };
  readonly blocks: SiteBlock[];
}): React.ReactElement {
  return (
    <SectionWrapper id="fleet">
      <AnimateOnScroll animation="fadeUp">
        <h2 className="text-center text-3xl font-bold text-offwhite md:text-4xl">
          <BillingText en={heading.en} te={heading.te} />
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted">
          <BillingText en={sub.en} te={sub.te} />
        </p>
      </AnimateOnScroll>

      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {blocks.map((b, i) => (
          <FleetCard key={b.id} block={b} index={i} />
        ))}
      </div>
    </SectionWrapper>
  );
}

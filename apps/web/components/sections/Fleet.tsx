"use client";

import type { SiteBlock } from "@prisma/client";
import { AnimateOnScroll } from "../ui/AnimateOnScroll";
import { BillingText } from "../ui/BillingText";
import { SectionWrapper } from "../ui/SectionWrapper";
import { FleetIcon } from "./FleetIcon";

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
          <AnimateOnScroll key={b.id} animation="scaleIn" delay={i * 60}>
            <article className="group flex h-full flex-col rounded-xl border border-border bg-surface/80 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand/50 hover:shadow-[0_12px_40px_rgba(212,88,0,0.12)]">
              <FleetIcon
                name={b.icon}
                className="size-9 text-brand transition-transform group-hover:scale-110"
              />
              <h3 className="mt-3 text-lg font-semibold text-offwhite">
                <BillingText
                  en={b.heading_en ?? ""}
                  te={b.heading_te ?? b.heading_en}
                />
              </h3>
              <p className="mt-2 text-sm text-muted">
                <BillingText
                  en={b.body_en ?? ""}
                  te={b.body_te ?? b.body_en}
                />
              </p>
            </article>
          </AnimateOnScroll>
        ))}
      </div>
    </SectionWrapper>
  );
}

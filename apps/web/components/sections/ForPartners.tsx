"use client";

import type { SiteBlock } from "@prisma/client";
import { ADMIN_URL } from "../../lib/env";
import { AnimateOnScroll } from "../ui/AnimateOnScroll";
import { BillingText } from "../ui/BillingText";
import { Button } from "../ui/Button";
import { SectionWrapper } from "../ui/SectionWrapper";

export function ForPartners({
  hook,
  sub,
  blocks,
}: {
  readonly hook: { readonly en: string; readonly te?: string | null };
  readonly sub: { readonly en: string; readonly te?: string | null };
  readonly blocks: SiteBlock[];
}): React.ReactElement {
  return (
    <SectionWrapper id="partners">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-dark">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-brand via-accent to-transparent opacity-80" />
        <div className="grid gap-10 p-8 md:grid-cols-2 md:p-12 lg:gap-16">
          <AnimateOnScroll animation="fadeUp">
            <h2 className="text-balance text-3xl font-extrabold leading-tight text-offwhite md:text-4xl lg:text-5xl">
              <BillingText en={hook.en} te={hook.te} />
            </h2>
            <p className="mt-5 max-w-md text-lg text-muted">
              <BillingText en={sub.en} te={sub.te} />
            </p>
            <div className="mt-8">
              <Button href={ADMIN_URL} external variant="primary" size="lg">
                List Your Fleet Today
              </Button>
            </div>
          </AnimateOnScroll>

          <div className="flex flex-col gap-4">
            {blocks.map((b, i) => (
              <AnimateOnScroll key={b.id} animation="fadeIn" delay={i * 80}>
                <article className="rounded-xl border border-border bg-surface/90 p-5 transition-shadow hover:shadow-[0_0_24px_rgba(212,88,0,0.15)]">
                  <h3 className="text-lg font-semibold text-offwhite">
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
        </div>
      </div>
    </SectionWrapper>
  );
}

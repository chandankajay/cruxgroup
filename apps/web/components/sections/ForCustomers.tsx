"use client";

import type { SiteBlock } from "@prisma/client";
import { BOOKINGS_URL } from "../../lib/env";
import { AnimateOnScroll } from "../ui/AnimateOnScroll";
import { BillingText } from "../ui/BillingText";
import { Button } from "../ui/Button";
import { SectionWrapper } from "../ui/SectionWrapper";

export function ForCustomers({
  heading,
  sub,
  blocks,
  phone,
}: {
  readonly heading: { readonly en: string; readonly te?: string | null };
  readonly sub: { readonly en: string; readonly te?: string | null };
  readonly blocks: SiteBlock[];
  readonly phone: string;
}): React.ReactElement {
  const tel = phone ? `tel:+${phone.replace(/\D/g, "")}` : "";

  return (
    <SectionWrapper id="customers" dark>
      <AnimateOnScroll animation="fadeUp">
        <h2 className="text-center text-3xl font-bold text-offwhite md:text-4xl">
          <BillingText en={heading.en} te={heading.te} />
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted">
          <BillingText en={sub.en} te={sub.te} />
        </p>
      </AnimateOnScroll>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {blocks.map((b, i) => (
          <AnimateOnScroll key={b.id} animation="scaleIn" delay={i * 70}>
            <article className="flex h-full flex-col rounded-xl border border-border bg-dark/60 p-6">
              <h3 className="text-lg font-semibold text-offwhite">
                <BillingText
                  en={b.heading_en ?? ""}
                  te={b.heading_te ?? b.heading_en}
                />
              </h3>
              <p className="mt-3 flex-1 text-sm text-muted">
                <BillingText
                  en={b.body_en ?? ""}
                  te={b.body_te ?? b.body_en}
                />
              </p>
            </article>
          </AnimateOnScroll>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Button href={BOOKINGS_URL} external variant="primary" size="lg">
          Book a Machine Now
        </Button>
        {tel ? (
          <Button href={tel} variant="outline" size="lg">
            Call Us
          </Button>
        ) : null}
      </div>
    </SectionWrapper>
  );
}

"use client";

import type { SiteBlock } from "@prisma/client";
import { ADMIN_URL, BOOKINGS_URL } from "../../lib/env";
import { AnimateOnScroll } from "../ui/AnimateOnScroll";
import { BillingText } from "../ui/BillingText";
import { Button } from "../ui/Button";

export function CTAStrip({
  block,
  secondaryLabel,
}: {
  readonly block: SiteBlock;
  readonly secondaryLabel: { readonly en: string; readonly te?: string | null };
}): React.ReactElement {
  return (
    <section className="bg-brand py-16 md:py-20">
      <div className="mx-auto max-w-[1280px] px-4 text-center sm:px-6 lg:px-8">
        <AnimateOnScroll animation="fadeUp">
          <h2 className="text-balance text-3xl font-extrabold text-offwhite md:text-4xl">
            <BillingText
              en={block.heading_en ?? ""}
              te={block.heading_te ?? block.heading_en}
            />
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-offwhite/90">
            <BillingText
              en={block.body_en ?? ""}
              te={block.body_te ?? block.body_en}
            />
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button href={BOOKINGS_URL} external variant="inverse" size="lg">
              <BillingText
                en={block.cta_label_en ?? "Start Renting"}
                te={block.cta_label_te ?? block.cta_label_en}
              />
            </Button>
            <Button href={ADMIN_URL} external variant="inverse" size="lg">
              <BillingText
                en={secondaryLabel.en}
                te={secondaryLabel.te ?? secondaryLabel.en}
              />
            </Button>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}

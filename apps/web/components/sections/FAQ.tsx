"use client";

import type { SiteBlock } from "@prisma/client";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/cn";
import { AnimateOnScroll } from "../ui/AnimateOnScroll";
import { BillingText } from "../ui/BillingText";
import { SectionWrapper } from "../ui/SectionWrapper";

export function FAQ({
  heading,
  blocks,
}: {
  readonly heading: { readonly en: string; readonly te?: string | null };
  readonly blocks: SiteBlock[];
}): React.ReactElement {
  const [openId, setOpenId] = useState<string | null>(blocks[0]?.id ?? null);

  return (
    <SectionWrapper id="faq">
      <AnimateOnScroll animation="fadeUp" className="mx-auto max-w-[800px]">
        <h2 className="text-center text-3xl font-bold text-offwhite md:text-4xl">
          <BillingText en={heading.en} te={heading.te} />
        </h2>
      </AnimateOnScroll>

      <div className="mx-auto mt-10 max-w-[800px] space-y-2">
        {blocks.map((b, i) => {
          const isOpen = openId === b.id;
          return (
            <AnimateOnScroll key={b.id} animation="fadeIn" delay={i * 40}>
              <div className="overflow-hidden rounded-xl border border-border bg-surface/80">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
                  onClick={() => setOpenId(isOpen ? null : b.id)}
                  aria-expanded={isOpen}
                >
                  <span className="font-medium text-offwhite">
                    <BillingText
                      en={b.heading_en ?? ""}
                      te={b.heading_te ?? b.heading_en}
                    />
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 text-brand transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="border-t border-border px-4 py-3 text-sm leading-relaxed text-muted">
                      <BillingText
                        en={b.body_en ?? ""}
                        te={b.body_te ?? b.body_en}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

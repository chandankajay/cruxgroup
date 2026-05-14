"use client";

import { ChevronDown } from "lucide-react";
import { ADMIN_URL, BOOKINGS_URL } from "../../lib/env";
import { AnimateOnScroll } from "../ui/AnimateOnScroll";
import { BillingText } from "../ui/BillingText";
import { Button } from "../ui/Button";

export function Hero({
  eyebrow,
  tagline,
  subtitle,
}: {
  readonly eyebrow: { readonly en: string; readonly te?: string | null };
  readonly tagline: { readonly en: string; readonly te?: string | null };
  readonly subtitle: { readonly en: string; readonly te?: string | null };
}): React.ReactElement {
  return (
    <section
      id="hero"
      className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center overflow-hidden bg-dark px-4 pt-14 pb-16 sm:pt-16 md:pt-20"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212,88,0,0.35), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(255,122,47,0.08), transparent 50%)",
        }}
      />

      <AnimateOnScroll animation="fadeUp" className="relative z-10 max-w-4xl text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand sm:text-sm">
          <BillingText en={eyebrow.en} te={eyebrow.te} />
        </p>
        <h1 className="text-balance text-[clamp(2.25rem,6vw,3.75rem)] font-extrabold leading-tight text-offwhite">
          <BillingText en={tagline.en} te={tagline.te} />
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted sm:text-lg">
          <BillingText en={subtitle.en} te={subtitle.te} />
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button href={BOOKINGS_URL} external variant="primary" size="lg">
            Book a Machine
          </Button>
          <Button href={ADMIN_URL} external variant="outline" size="lg">
            Register Your Fleet
          </Button>
        </div>
      </AnimateOnScroll>

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-muted">
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <ChevronDown className="size-6 animate-bounce" aria-hidden />
      </div>
    </section>
  );
}

"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { ADMIN_URL, BOOKINGS_URL } from "../../lib/env";
import { AnimateOnScroll } from "../ui/AnimateOnScroll";
import { BillingText } from "../ui/BillingText";
import { Button } from "../ui/Button";

const HERO_OVERLAY =
  "linear-gradient(to bottom, rgba(15,14,13,0.72) 0%, rgba(15,14,13,0.55) 50%, rgba(15,14,13,0.85) 100%)";

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
      className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center overflow-x-clip overflow-y-hidden px-4 pt-14 pb-16 sm:pt-16 md:pt-20"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <Image
          src="/images/hero-excavator.jpg"
          alt="Excavator at a construction site in Telangana"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0" style={{ background: HERO_OVERLAY }} />
        <div
          className="absolute inset-0 opacity-35"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212,88,0,0.4), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(255,122,47,0.1), transparent 50%)",
          }}
        />
      </div>

      <AnimateOnScroll animation="fadeUp" className="relative z-10 max-w-4xl text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand sm:text-sm">
          <BillingText en={eyebrow.en} te={eyebrow.te} />
        </p>
        <h1 className="max-w-full text-balance break-words text-[clamp(2.25rem,6vw,3.75rem)] font-extrabold leading-tight text-offwhite">
          <BillingText en={tagline.en} te={tagline.te} />
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty break-words text-base text-muted sm:text-lg">
          <BillingText en={subtitle.en} te={subtitle.te} />
        </p>
        <div className="mt-10 flex min-w-0 max-w-full flex-wrap items-center justify-center gap-4 touch-manipulation">
          <Button href={BOOKINGS_URL} external variant="primary" size="lg" className="min-h-12">
            Book a Machine
          </Button>
          <Button href={ADMIN_URL} external variant="outline" size="lg" className="min-h-12">
            Register Your Fleet
          </Button>
        </div>
      </AnimateOnScroll>

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-muted">
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <ChevronDown className="size-6 animate-bounce" aria-hidden />
      </div>
    </section>
  );
}

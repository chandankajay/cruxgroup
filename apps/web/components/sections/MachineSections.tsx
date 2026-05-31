"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "../../lib/locale";
import { useLang } from "../ui/LanguageProvider";
import { Button } from "../ui/Button";
import { MACHINE_SLIDES, type MachineSlide } from "./machine-sections-data";
import { MachineSectionsDesktop } from "./MachineSectionsDesktop";

const BG_PANEL = "#0f0e0d";

const MOBILE_MQ = "(max-width: 767px)";

function resolveSlide(slide: MachineSlide, lang: Locale) {
  const te = lang === "te";
  return {
    eyebrow: te ? slide.eyebrow_te : slide.eyebrow,
    title: te ? slide.title_te : slide.title_en,
    body: te ? slide.body_te : slide.body_en,
    specs: slide.specs.map((s) => ({ label: te ? s.label_te : s.label_en })),
    cta: te ? slide.cta_te : slide.cta_en,
  };
}

/**
 * Mobile-only cards: pure JSX + Tailwind (no framer-motion).
 * Phase 4B-SAFE: touch scroll and iOS Safari behave better without sticky / scroll-linked motion.
 */
function MachineSectionsMobileStack({
  lang,
}: {
  readonly lang: Locale;
}): React.ReactElement {
  return (
    <section className="overflow-x-clip border-y border-border/40 bg-dark">
      <div className="mx-auto max-w-lg space-y-8 px-4 py-14 pb-[max(3.5rem,env(safe-area-inset-bottom))]">
        {MACHINE_SLIDES.map((slide) => (
          <MachineMobileCard
            key={slide.id}
            slide={slide}
            resolved={resolveSlide(slide, lang)}
            lang={lang}
          />
        ))}
      </div>
    </section>
  );
}

function MachineMobileCard({
  slide,
  resolved,
  lang,
}: {
  readonly slide: MachineSlide;
  readonly resolved: ReturnType<typeof resolveSlide>;
  readonly lang: Locale;
}): React.ReactElement {
  return (
    <article className="max-w-full overflow-hidden rounded-2xl border border-border/60 bg-surface shadow-lg">
      <Link href={`/${lang}/equipment/${slide.id}`} className="relative block aspect-video w-full max-w-full">
        <Image
          src={slide.image}
          alt={slide.imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 512px"
        />
      </Link>
      <div
        className="min-w-0 px-5 py-6 sm:px-6"
        style={{ backgroundColor: BG_PANEL }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
          {resolved.eyebrow}
        </p>
        <Link href={`/${lang}/equipment/${slide.id}`}>
          <h2 className="mt-2 max-w-full text-pretty break-words text-2xl font-extrabold leading-snug text-offwhite hover:text-brand transition-colors">
            {resolved.title}
          </h2>
        </Link>
        <p className="mt-3 max-w-full text-pretty break-words text-sm leading-relaxed text-muted">
          {resolved.body}
        </p>
        <ul className="mt-5 flex max-w-full flex-wrap gap-2">
          {resolved.specs.map((s) => (
            <li
              key={s.label}
              className="max-w-full min-w-0 break-words rounded-full border border-brand/80 bg-dark/80 px-3 py-2 text-xs leading-snug text-offwhite/90 [overflow-wrap:anywhere]"
            >
              {s.label}
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <Button
            href={`/${lang}/equipment/${slide.id}`}
            variant="primary"
            size="lg"
            className="min-h-12 w-full touch-manipulation sm:w-auto"
          >
            {resolved.cta}
          </Button>
        </div>
      </div>
    </article>
  );
}

export function MachineSections(): React.ReactElement {
  const { lang } = useLang();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const apply = (): void => {
      setIsMobile(mq.matches);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  if (isMobile) {
    return <MachineSectionsMobileStack lang={lang} />;
  }

  return <MachineSectionsDesktop lang={lang} />;
}

"use client";

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { Locale } from "../../lib/locale";
import { Button } from "../ui/Button";
import { type MachineSlide, MACHINE_SLIDES } from "./machine-sections-data";

const SCROLL_PER_SLIDE_VH = 100;

/** Fraction of each slide segment used for enter/exit crossfade. */
const FADE = 0.18;

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

function slideOpacity(progress: number, index: number, total: number): number {
  const seg = 1 / total;
  const start = index * seg;
  const end = start + seg;

  if (progress <= start - seg * 0.01 || progress >= end + seg * 0.01) return 0;

  const local = (progress - start) / seg;

  if (local <= FADE) return local / FADE;
  if (local >= 1 - FADE) return (1 - local) / FADE;
  return 1;
}

function slideOffsetY(progress: number, index: number, total: number): string {
  const seg = 1 / total;
  const start = index * seg;
  const end = start + seg;

  if (progress < start || progress >= end) {
    return progress < start ? "6%" : "-6%";
  }

  const local = (progress - start) / seg;

  if (local <= FADE) {
    const t = 1 - local / FADE;
    return `${t * 6}%`;
  }
  if (local >= 1 - FADE) {
    const t = (local - (1 - FADE)) / FADE;
    return `${-t * 6}%`;
  }
  return "0%";
}

function useSlideAnimation(
  scrollYProgress: MotionValue<number>,
  index: number,
  total: number,
) {
  const opacity = useTransform(scrollYProgress, (p) =>
    slideOpacity(p, index, total),
  );
  const y = useTransform(scrollYProgress, (p) =>
    slideOffsetY(p, index, total),
  );

  return { opacity, y };
}

function MachineSlideDesktop({
  image,
  imageAlt,
  eyebrow,
  title,
  body,
  specs,
  cta,
  detailHref,
  priority,
}: {
  readonly image: string;
  readonly imageAlt: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly body: string;
  readonly specs: readonly { label: string }[];
  readonly cta: string;
  readonly detailHref: string;
  readonly priority?: boolean;
}): React.ReactElement {
  return (
    <div className="flex h-full min-h-0 w-full">
      <div className="relative h-full min-h-0 w-[55%] shrink-0 overflow-hidden bg-[#0f0e0d]">
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority={priority}
          className="object-cover object-center"
          sizes="55vw"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-[min(40%,12rem)] bg-gradient-to-r from-transparent to-[#0f0e0d]"
          aria-hidden
        />
      </div>
      <div className="flex h-full min-h-0 w-[45%] shrink-0 flex-col justify-center bg-[#0f0e0d] px-8 py-10 lg:px-12">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
            {eyebrow}
          </p>
          <Link href={detailHref}>
            <h2 className="mt-3 text-balance break-words font-extrabold leading-tight text-offwhite transition-colors hover:text-brand [font-size:clamp(2rem,4vw,3.5rem)]">
              {title}
            </h2>
          </Link>
          <p className="mt-4 max-w-md text-[1.1rem] leading-relaxed text-muted">
            {body}
          </p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {specs.map((s) => (
              <li
                key={s.label}
                className="max-w-full break-words rounded-full border border-brand/80 bg-surface/40 px-3 py-1.5 text-xs font-medium text-offwhite/90"
              >
                {s.label}
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Button href={detailHref} variant="primary" size="lg">
              {cta}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideLayer({
  slide,
  lang,
  scrollYProgress,
  index,
  total,
  interactive,
}: {
  readonly slide: MachineSlide;
  readonly lang: Locale;
  readonly scrollYProgress: MotionValue<number>;
  readonly index: number;
  readonly total: number;
  readonly interactive: boolean;
}): React.ReactElement {
  const resolved = useMemo(() => resolveSlide(slide, lang), [slide, lang]);
  const { opacity, y } = useSlideAnimation(scrollYProgress, index, total);

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden bg-[#0f0e0d]"
      style={{
        zIndex: index + 1,
        opacity,
        y,
        pointerEvents: interactive ? "auto" : "none",
      }}
    >
      <MachineSlideDesktop
        image={slide.image}
        imageAlt={slide.imageAlt}
        eyebrow={resolved.eyebrow}
        title={resolved.title}
        body={resolved.body}
        specs={resolved.specs}
        cta={resolved.cta}
        detailHref={`/${lang}/equipment/${slide.id}`}
        priority={index === 0}
      />
    </motion.div>
  );
}

export function MachineSectionsDesktop({
  lang,
}: {
  readonly lang: Locale;
}): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const total = MACHINE_SLIDES.length;
  const containerHeight = `${total * SCROLL_PER_SLIDE_VH}vh`;

  const [activeSlide, setActiveSlide] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v: number) => {
    setActiveSlide(Math.min(Math.floor(v * total), total - 1));
  });

  return (
    <section ref={containerRef} className="relative" style={{ height: containerHeight }}>
      <div className="sticky top-0 h-[100dvh] min-h-0 w-full overflow-hidden bg-[#0f0e0d]">
        {MACHINE_SLIDES.map((slide, i) => (
          <SlideLayer
            key={slide.id}
            slide={slide}
            lang={lang}
            scrollYProgress={scrollYProgress}
            index={i}
            total={total}
            interactive={activeSlide === i}
          />
        ))}
      </div>
    </section>
  );
}

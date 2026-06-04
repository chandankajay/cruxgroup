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

function useSlideTransforms(
  scrollYProgress: MotionValue<number>,
  index: number,
  total: number,
) {
  const segmentSize = 1 / total;
  const start = index * segmentSize;
  const end = start + segmentSize;

  const isFirst = index === 0;

  const imgIn = start + segmentSize * 0.02;
  const imgSettled = start + segmentSize * 0.15;
  const imgExitStart = end - segmentSize * 0.15;
  const imgY = useTransform(
    scrollYProgress,
    isFirst
      ? [start, imgExitStart, end]
      : [start, imgIn, imgSettled, imgExitStart, end],
    isFirst
      ? ["0%", "0%", "-100%"]
      : ["100%", "30%", "0%", "0%", "-100%"],
  );

  const textIn = isFirst ? start : start + segmentSize * 0.04;
  const textSettled = isFirst ? start : start + segmentSize * 0.2;
  const textExitStart = end - segmentSize * 0.2;
  const textExit = end - segmentSize * 0.05;
  const textOpacity = useTransform(
    scrollYProgress,
    isFirst
      ? [start, textExitStart, textExit]
      : [textIn, textSettled, textExitStart, textExit],
    isFirst ? [1, 1, 0] : [0, 1, 1, 0],
  );
  const textX = useTransform(
    scrollYProgress,
    isFirst
      ? [start, textExitStart, textExit]
      : [textIn, textSettled, textExitStart, textExit],
    isFirst ? ["0px", "0px", "-40px"] : ["40px", "0px", "0px", "-40px"],
  );

  const layerOpacity = useTransform(
    scrollYProgress,
    isFirst ? [0, 1] : [start - 0.002, start],
    [isFirst ? 1 : 0, 1],
  );

  return { imgY, textOpacity, textX, layerOpacity };
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
  imgY,
  textOpacity,
  textX,
  interactive,
}: {
  readonly image: string;
  readonly imageAlt: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly body: string;
  readonly specs: readonly { label: string }[];
  readonly cta: string;
  readonly detailHref: string;
  readonly imgY: MotionValue<string>;
  readonly textOpacity: MotionValue<number>;
  readonly textX: MotionValue<string>;
  readonly interactive: boolean;
}): React.ReactElement {
  return (
    <div
      className="flex h-full min-h-0 w-full"
      style={{ pointerEvents: interactive ? "auto" : "none" }}
    >
      <div className="relative h-full min-h-0 w-[55%] shrink-0 overflow-hidden bg-[#0f0e0d]">
        <motion.div className="absolute inset-0 will-change-transform" style={{ y: imgY }}>
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="object-cover object-center"
            sizes="55vw"
          />
        </motion.div>
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-[min(40%,12rem)] bg-gradient-to-r from-transparent to-[#0f0e0d]"
          aria-hidden
        />
      </div>
      <motion.div
        className="flex h-full min-h-0 w-[45%] shrink-0 flex-col justify-center bg-[#0f0e0d] px-8 py-10 lg:px-12"
        style={{ x: textX }}
      >
        <motion.div className="min-w-0" style={{ opacity: textOpacity }}>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">{eyebrow}</p>
          <Link href={detailHref}>
            <h2 className="mt-3 text-balance break-words font-extrabold leading-tight text-offwhite hover:text-brand transition-colors [font-size:clamp(2rem,4vw,3.5rem)]">
              {title}
            </h2>
          </Link>
          <p className="mt-4 max-w-md text-[1.1rem] leading-relaxed text-muted">{body}</p>
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
        </motion.div>
      </motion.div>
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
  const { imgY, textOpacity, textX, layerOpacity } = useSlideTransforms(
    scrollYProgress,
    index,
    total,
  );

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden bg-[#0f0e0d]"
      style={{ zIndex: index + 1, opacity: layerOpacity }}
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
        imgY={imgY}
        textOpacity={textOpacity}
        textX={textX}
        interactive={interactive}
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
    const idx = Math.min(Math.floor(v * total), total - 1);
    setActiveSlide(idx);
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

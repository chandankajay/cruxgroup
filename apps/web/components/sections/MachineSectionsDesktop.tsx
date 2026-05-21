"use client";

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BOOKINGS_URL } from "../../lib/env";
import type { Locale } from "../../lib/locale";
import { Button } from "../ui/Button";
import { type MachineSlide, MACHINE_SLIDES } from "./machine-sections-data";

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

function MachineSlideDesktop({
  image,
  imageAlt,
  eyebrow,
  title,
  body,
  specs,
  cta,
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
          <h2 className="mt-3 text-balance break-words font-extrabold leading-tight text-offwhite [font-size:clamp(2rem,4vw,3.5rem)]">
            {title}
          </h2>
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
            <Button href={BOOKINGS_URL} external variant="primary" size="lg">
              {cta}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
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

  // Slide 1 (JCB): image in a bit faster so less time on empty panel before the photo arrives.
  const img0 = useTransform(scrollYProgress, [0, 0.12, 0.36, 0.5], ["100%", "0%", "0%", "-100%"]);
  const text0Opacity = useTransform(scrollYProgress, [0.04, 0.18, 0.32, 0.46], [0, 1, 1, 0]);
  const text0X = useTransform(scrollYProgress, [0.04, 0.18, 0.32, 0.46], ["40px", "0px", "0px", "-40px"]);

  // Slide 2 sits above slide 1 (z-index). Without animating this layer's opacity, it paints solid #0f0e0d
  // over the whole viewport for the first half of the scroll track — hiding JCB (black screen).
  // Fade slide 2 in only once we're past the midpoint; align text fade with the same beat (no 0.5–0.52 gap).
  const slide2LayerOpacity = useTransform(scrollYProgress, [0, 0.498, 0.5], [0, 0, 1]);

  const img1 = useTransform(scrollYProgress, [0.5, 0.64, 0.88, 1], ["100%", "0%", "0%", "-100%"]);
  const text1Opacity = useTransform(scrollYProgress, [0.5, 0.62, 0.84, 0.98], [0, 1, 1, 0]);
  const text1X = useTransform(scrollYProgress, [0.5, 0.62, 0.84, 0.98], ["40px", "0px", "0px", "-40px"]);

  const [activeSlide, setActiveSlide] = useState<0 | 1>(0);
  useEffect(() => {
    setActiveSlide(scrollYProgress.get() < 0.5 ? 0 : 1);
  }, [scrollYProgress]);
  useMotionValueEvent(scrollYProgress, "change", (v: number) => {
    setActiveSlide(v < 0.5 ? 0 : 1);
  });

  const slides = MACHINE_SLIDES;
  const s0 = resolveSlide(slides[0], lang);
  const s1 = resolveSlide(slides[1], lang);

  return (
    <section ref={containerRef} className="relative h-[300vh]">
      <div className="sticky top-0 h-[100dvh] min-h-0 w-full overflow-hidden bg-[#0f0e0d]">
        <div className="absolute inset-0 z-[1] overflow-hidden bg-[#0f0e0d]">
          <MachineSlideDesktop
            image={slides[0].image}
            imageAlt={slides[0].imageAlt}
            eyebrow={s0.eyebrow}
            title={s0.title}
            body={s0.body}
            specs={s0.specs}
            cta={s0.cta}
            imgY={img0}
            textOpacity={text0Opacity}
            textX={text0X}
            interactive={activeSlide === 0}
          />
        </div>
        <motion.div
          className="absolute inset-0 z-[2] overflow-hidden bg-[#0f0e0d]"
          style={{ opacity: slide2LayerOpacity }}
        >
          <MachineSlideDesktop
            image={slides[1].image}
            imageAlt={slides[1].imageAlt}
            eyebrow={s1.eyebrow}
            title={s1.title}
            body={s1.body}
            specs={s1.specs}
            cta={s1.cta}
            imgY={img1}
            textOpacity={text1Opacity}
            textX={text1X}
            interactive={activeSlide === 1}
          />
        </motion.div>
      </div>
    </section>
  );
}

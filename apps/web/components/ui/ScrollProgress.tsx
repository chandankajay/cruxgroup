"use client";

import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Fixed 2px brand-orange bar; fades in after ~half viewport scroll (past hero fold).
 */
export function ScrollProgress(): React.ReactElement {
  const { scrollYProgress } = useScroll();

  const scaleX = scrollYProgress;

  const opacity = useTransform(scrollYProgress, (p: number) => {
    if (p <= 0.05) {
      return 0;
    }
    if (p >= 0.12) {
      return 1;
    }
    return (p - 0.05) / 0.07;
  });

  return (
    <motion.div
      className="pointer-events-none fixed left-0 right-0 top-16 z-40 h-[2px] origin-left bg-brand"
      style={{ scaleX, opacity }}
      aria-hidden
    />
  );
}

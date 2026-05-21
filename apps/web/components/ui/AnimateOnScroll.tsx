"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "../../lib/cn";

type Animation = "fadeUp" | "fadeIn" | "scaleIn";

const classMap: Record<Animation, string> = {
  fadeUp: "animate-fade-up",
  fadeIn: "animate-fade-in",
  scaleIn: "animate-scale-in",
};

export function AnimateOnScroll({
  children,
  animation = "fadeUp",
  delay = 0,
  threshold = 0.12,
  className,
}: {
  readonly children: ReactNode;
  readonly animation?: Animation;
  readonly delay?: number;
  readonly threshold?: number;
  readonly className?: string;
}): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (): void => setReduceMotion(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setActive(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setActive(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reduceMotion, threshold]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !active || reduceMotion) return;
    const onEnd = (): void => {
      el.style.willChange = "auto";
    };
    el.addEventListener("animationend", onEnd);
    el.style.willChange = "transform, opacity";
    return () => el.removeEventListener("animationend", onEnd);
  }, [active, reduceMotion]);

  const style = (
    active && !reduceMotion ? { ["--delay" as string]: `${delay}ms` } : { ["--delay" as string]: "0ms" }
  ) as CSSProperties;

  return (
    <div
      ref={ref}
      className={cn(
        className,
        active && (reduceMotion ? "opacity-100" : classMap[animation])
      )}
      style={style}
    >
      {children}
    </div>
  );
}

"use client";

import { memo, useEffect, useRef, useState } from "react";
import type { SiteBlock } from "@prisma/client";
import { AnimateOnScroll } from "../ui/AnimateOnScroll";
import { BillingText } from "../ui/BillingText";

function CountUpInner({
  target,
  label,
}: {
  readonly target: number;
  readonly label: { readonly en: string; readonly te?: string | null };
}): React.ReactElement {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || started.current) return;
        started.current = true;
        const duration = 1200;
        const start = performance.now();
        function frame(now: number): void {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - (1 - t) ** 3;
          setValue(Math.round(target * eased));
          if (t < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="px-2 py-4 text-center">
      <div className="font-mono text-4xl font-bold tabular-nums text-offwhite sm:text-5xl">
        {value.toLocaleString("en-IN")}
      </div>
      <div className="mt-2 text-sm text-muted">
        <BillingText en={label.en} te={label.te} />
      </div>
    </div>
  );
}

export const CountUp = memo(CountUpInner);

export function StatsBar({
  blocks,
}: {
  readonly blocks: SiteBlock[];
}): React.ReactElement {
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
        <AnimateOnScroll animation="fadeIn">
          <div className="grid grid-cols-2 gap-y-8 md:grid-cols-4 md:divide-x md:divide-border md:[&>div]:px-6">
            {blocks.map((b) => {
              const raw = b.body_en ?? "0";
              const target = Number.parseInt(raw.replace(/\D/g, ""), 10) || 0;
              const label = { en: b.heading_en ?? "", te: b.heading_te };
              return (
                <CountUp key={b.id} target={target} label={label} />
              );
            })}
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}

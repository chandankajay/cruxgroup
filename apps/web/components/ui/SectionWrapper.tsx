import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export function SectionWrapper({
  id,
  dark,
  className,
  children,
}: {
  readonly id?: string;
  readonly dark?: boolean;
  readonly className?: string;
  readonly children: ReactNode;
}): React.ReactElement {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-20 py-16 md:py-24",
        dark ? "bg-surface" : "bg-dark",
        className
      )}
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

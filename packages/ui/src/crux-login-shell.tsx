import type { ReactNode } from "react";
import { cn } from "./lib/utils";

export interface CruxLoginShellProps {
  /** Brand mark (e.g. next/image or img inside Link). */
  readonly logo: ReactNode;
  /** Primary headline (e.g. “Powering Your Projects”). */
  readonly headline: ReactNode;
  /** Supporting line under the headline. */
  readonly subheadline: string;
  /** Form card content (OTP, SSO, etc.). */
  readonly children: ReactNode;
  /** Optional content below the card (dev hints, legal). */
  readonly belowFold?: ReactNode;
}

/**
 * Enterprise split login: brand on top (mobile) / left (desktop), form below / right.
 * Viewport is locked to 100dvh with overflow contained to reduce page scroll issues.
 */
export function CruxLoginShell({
  logo,
  headline,
  subheadline,
  children,
  belowFold,
}: CruxLoginShellProps) {
  return (
    <main className="relative flex min-h-0 w-full min-h-[100dvh] flex-col overflow-x-hidden bg-zinc-950 lg:h-[100dvh] lg:max-h-[100dvh] lg:overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-zinc-950 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/loginbg.jpg')" }}
      />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-black/75 via-black/55 to-zinc-950/90" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.08),_transparent_55%)]" />

      <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col lg:min-h-0 lg:flex-row">
        {/* Brand column — top on mobile, left on lg */}
        <section
          className={cn(
            "flex shrink-0 flex-col items-center border-b border-white/5 px-5 pb-4 pt-6 text-center",
            "sm:px-8 sm:pb-6 sm:pt-8",
            "lg:w-1/2 lg:max-w-[50%] lg:items-start lg:justify-center lg:border-b-0 lg:border-r lg:border-white/10 lg:px-12 lg:pb-12 lg:pt-12 lg:text-left",
            "xl:px-16"
          )}
        >
          <div className="flex w-full max-w-xl flex-col items-center gap-3 sm:gap-4 lg:items-start lg:gap-7">
            <div className="flex w-full justify-center lg:justify-start">{logo}</div>
            <div className="w-full space-y-3 lg:space-y-4">
              <div className="text-balance text-3xl font-extrabold leading-[1.15] tracking-tight text-white drop-shadow-sm sm:text-4xl lg:text-[2.35rem] xl:text-5xl [&_span]:text-amber-500">
                {headline}
              </div>
              <p className="text-pretty text-sm font-medium leading-relaxed tracking-wide text-zinc-300 sm:text-base lg:max-w-md lg:text-[0.95rem] xl:text-base">
                {subheadline}
              </p>
            </div>
            <div
              className="hidden h-px w-16 rounded-full bg-gradient-to-r from-amber-500/80 to-transparent lg:block"
              aria-hidden
            />
          </div>
        </section>

        {/* Form column — scrolls only if needed (keyboard / small viewports) */}
        <section
          className={cn(
            "flex min-h-0 flex-1 flex-col justify-start overflow-y-auto overscroll-y-contain px-4 pb-6 pt-3",
            "sm:px-8 sm:pb-8 sm:pt-4",
            "lg:justify-center lg:px-10 lg:py-10",
            "lg:w-1/2 lg:max-w-[50%] lg:flex-none lg:basis-1/2",
            "xl:px-14"
          )}
        >
          <div className="mx-auto flex w-full min-h-0 max-w-md flex-col gap-4 lg:max-w-lg">
            {children}
            {belowFold ? <div className="shrink-0">{belowFold}</div> : null}
          </div>
        </section>
      </div>
    </main>
  );
}

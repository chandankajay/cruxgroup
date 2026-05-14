"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "outline" | "ghost" | "inverse";
type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  primary:
    "bg-brand text-offwhite shadow-[0_0_0_0_rgba(212,88,0,0)] hover:shadow-[0_0_24px_rgba(212,88,0,0.35)] hover:scale-[1.02] active:scale-[0.99]",
  outline:
    "border-2 border-brand text-brand bg-transparent hover:bg-brand/10 hover:scale-[1.02] active:scale-[0.99]",
  ghost: "text-offwhite hover:bg-surface/80 hover:text-accent",
  inverse:
    "bg-offwhite text-dark hover:bg-white hover:scale-[1.02] active:scale-[0.99] shadow-md",
};

const sizeClass: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 gap-1.5 rounded-md",
  md: "text-sm px-4 py-2.5 gap-2 rounded-lg",
  lg: "text-base px-6 py-3 gap-2 rounded-lg",
};

export interface ButtonProps {
  readonly variant?: Variant;
  readonly size?: Size;
  readonly href?: string;
  readonly external?: boolean;
  readonly className?: string;
  readonly children: ReactNode;
  readonly iconLeft?: LucideIcon;
  readonly iconRight?: LucideIcon;
  readonly type?: "button" | "submit";
  readonly onClick?: () => void;
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  external,
  className,
  children,
  iconLeft: IL,
  iconRight: IR,
  type = "button",
  onClick,
}: ButtonProps): React.ReactElement {
  const inner = (
    <>
      {IL ? <IL className="size-4 shrink-0" aria-hidden /> : null}
      <span>{children}</span>
      {IR ? <IR className="size-4 shrink-0" aria-hidden /> : null}
    </>
  );

  const classes = cn(
    "inline-flex items-center justify-center font-semibold transition-transform duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    variantClass[variant],
    sizeClass[size],
    className
  );

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
        >
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {inner}
    </button>
  );
}

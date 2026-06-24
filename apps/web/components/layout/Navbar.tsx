"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ADMIN_URL, BOOKINGS_URL } from "../../lib/env";
import type { Locale } from "../../lib/locale";
import { cn } from "../../lib/cn";
import { Button } from "../ui/Button";
import { LanguageToggle } from "../ui/LanguageToggle";

const LINKS: { label: string; hash: string }[] = [
  { label: "About", hash: "#hero" },
  { label: "Fleet", hash: "#fleet" },
  { label: "Services", hash: "/services" },
  { label: "Partners", hash: "#partners" },
  { label: "Customers", hash: "#customers" },
  { label: "Blog", hash: "/blog" },
  { label: "Contact", hash: "#contact" },
];

export function Navbar({ locale }: { readonly locale: Locale }): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function hrefFor(item: (typeof LINKS)[number]): string {
    if (item.hash.startsWith("/")) return `/${locale}${item.hash}`;
    return `/${locale}${item.hash}`;
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-transparent bg-dark/80 backdrop-blur-md transition-colors",
        scrolled && "border-border bg-dark/95"
      )}
    >
      <nav className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 overflow-visible px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href={`/${locale}`}
          className="relative z-[60] -my-1 shrink-0 self-center md:-my-0.5"
          aria-label="Crux Group home"
        >
          <span
            className={cn(
              "relative isolate block rounded-lg bg-dark/50 p-1.5 ring-1 ring-white/[0.08] backdrop-blur-sm",
              "shadow-[0_4px_0_rgba(0,0,0,0.35),0_22px_48px_rgba(0,0,0,0.55),0_0_0_1px_rgba(212,88,0,0.12)]",
              "translate-y-1.5 md:translate-y-2 [transform:translate3d(0,0,0)]",
              "transition-[transform,box-shadow] duration-300 hover:translate-y-1 md:hover:translate-y-1.5 hover:shadow-[0_6px_0_rgba(0,0,0,0.28),0_28px_56px_rgba(0,0,0,0.5),0_0_28px_rgba(212,88,0,0.18)]"
            )}
          >
            <Image
              src="/logo.png"
              alt="Crux Group"
              width={320}
              height={77}
              priority
              className="pointer-events-none h-11 w-auto max-w-[min(260px,58vw)] object-contain object-left sm:h-[3.35rem] md:h-[4.25rem] md:max-w-[min(300px,42vw)] lg:h-[4.65rem] lg:max-w-[320px]"
            />
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((item) => (
            <Link
              key={item.label}
              href={hrefFor(item)}
              className="text-sm font-medium text-muted transition-colors hover:text-offwhite"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageToggle />
          <Button href={BOOKINGS_URL} external variant="primary" size="md">
            Rent Equipment
          </Button>
          <Button href={ADMIN_URL} external variant="outline" size="md">
            Partner with Us
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-offwhite md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-border bg-surface px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {LINKS.map((item) => (
              <Link
                key={item.label}
                href={hrefFor(item)}
                className="inline-flex min-h-11 items-center text-base font-medium text-offwhite"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center justify-between pt-2">
              <LanguageToggle />
            </div>
            <Button href={BOOKINGS_URL} external variant="primary" size="md">
              Rent Equipment
            </Button>
            <Button href={ADMIN_URL} external variant="outline" size="md">
              Partner with Us
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

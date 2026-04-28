"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, MapPin, Settings, LogOut } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { ThemeToggle } from "../../components/theme-toggle";

interface PartnerMobileHeaderProps {
  readonly className?: string;
  readonly userName: string | null;
  readonly userEmail: string | null;
  readonly userImage: string | null;
}

export function PartnerMobileHeader({
  className,
  userName,
  userEmail,
  userImage,
}: PartnerMobileHeaderProps) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const initials = userName
    ? userName
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  const sheetTransition = { type: "spring" as const, damping: 30, stiffness: 340, mass: 0.85 };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden",
          className
        )}
      >
        <Link
          href="/dashboard"
          className="flex min-h-11 min-w-11 shrink-0 touch-manipulation select-none items-center active:opacity-90"
          aria-label="Home"
        >
          <Image
            src="/logo.png"
            alt="Crux Group"
            width={200}
            height={70}
            unoptimized
            className="h-9 w-auto max-w-[8.5rem] object-contain object-left"
            priority
          />
        </Link>

        <div className="flex shrink-0 items-center gap-0.5">
          <ThemeToggle />
          <button
            type="button"
            className="flex size-11 touch-manipulation select-none items-center justify-center rounded-xl text-foreground hover:bg-accent"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu className="size-6" strokeWidth={2} aria-hidden />
          </button>
        </div>
      </header>

      <AnimatePresence mode="sync">
        {open
          ? [
              <motion.button
                key="partner-nav-backdrop"
                type="button"
                aria-label="Close menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-[2px]"
                onClick={close}
              />,
              <motion.aside
                key="partner-nav-panel"
                role="dialog"
                aria-modal="true"
                aria-label="Partner navigation"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={sheetTransition}
                className="fixed left-0 top-0 z-[70] flex h-dvh w-[min(19rem,88vw)] max-w-full flex-col border-r border-border bg-card shadow-2xl outline-none"
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">Menu</p>
                  <button
                    type="button"
                    className="rounded-lg px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    onClick={close}
                  >
                    Close
                  </button>
                </div>
                <div className="border-b border-border px-4 py-4">
                  {userImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={userImage}
                      alt=""
                      className="mb-3 size-12 shrink-0 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="mb-3 flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {initials}
                    </div>
                  )}
                  <p className="truncate font-semibold text-foreground">{userName ?? "Partner"}</p>
                  <p className="truncate text-sm text-muted-foreground">{userEmail ?? ""}</p>
                </div>
                <nav className="flex flex-col gap-1 overflow-y-auto px-2 py-3">
                  <Link
                    href="/service-area"
                    onClick={close}
                    className="flex min-h-14 touch-manipulation select-none items-center gap-3 rounded-xl px-3 text-sm font-medium text-foreground hover:bg-accent/80 active:bg-accent"
                  >
                    <MapPin className="size-5 shrink-0 text-primary" aria-hidden />
                    Service Area
                  </Link>
                  <Link
                    href="/settings/kyc"
                    onClick={close}
                    className="flex min-h-14 touch-manipulation select-none items-center gap-3 rounded-xl px-3 text-sm font-medium text-foreground hover:bg-accent/80 active:bg-accent"
                  >
                    <Settings className="size-5 shrink-0 text-primary" aria-hidden />
                    Trust Center / KYC
                  </Link>
                  <button
                    type="button"
                    className="mt-2 flex min-h-14 touch-manipulation select-none items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    onClick={() => {
                      close();
                      void signOut({ callbackUrl: "/login" });
                    }}
                  >
                    <LogOut className="size-5 shrink-0" aria-hidden />
                    Sign out
                  </button>
                </nav>
              </motion.aside>,
            ]
          : null}
      </AnimatePresence>
    </>
  );
}

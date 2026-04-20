"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarCheck, DollarSign, Home, Layers } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

const springTap = { type: "spring" as const, stiffness: 500, damping: 30 };

const tabs = [
  { href: "/dashboard", label: "Home", icon: Home, match: (p: string) => p === "/dashboard" || p === "/" },
  { href: "/fleet", label: "My Fleet", icon: Layers, match: (p: string) => p.startsWith("/fleet") },
  {
    href: "/my-bookings",
    label: "My Bookings",
    icon: CalendarCheck,
    match: (p: string) => p.startsWith("/my-bookings"),
  },
  { href: "/earnings", label: "Earnings", icon: DollarSign, match: (p: string) => p.startsWith("/earnings") },
] as const;

export function PartnerBottomNav({ className }: { readonly className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      role="navigation"
      aria-label="Primary"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-700 bg-zinc-900 pb-[env(safe-area-inset-bottom)] lg:hidden",
        className
      )}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around gap-1 px-2 pt-1">
        {tabs.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <motion.div
              key={href}
              className="flex min-h-[44px] min-w-0 flex-1 touch-manipulation select-none"
              whileTap={{ scale: 0.85 }}
              transition={springTap}
            >
              <Link
                href={href}
                className={cn(
                  "flex min-h-[44px] w-full flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium touch-manipulation select-none active:opacity-90",
                  active ? "text-white" : "text-zinc-500"
                )}
              >
                <Icon className="size-5 shrink-0" strokeWidth={active ? 2.25 : 2} aria-hidden />
                <span className="truncate">{label}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </nav>
  );
}

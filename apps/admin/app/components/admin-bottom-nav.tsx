"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@repo/ui/lib/utils";
import { ADMIN_NAV, isAdminNavItemActive } from "./admin-sidebar";

const springTap = { type: "spring" as const, stiffness: 500, damping: 30 };

export function AdminBottomNav({ className }: { readonly className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      role="navigation"
      aria-label="Primary admin"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-700 bg-zinc-900 pb-[env(safe-area-inset-bottom)] lg:hidden",
        className
      )}
    >
      <div className="flex gap-0.5 overflow-x-auto px-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ADMIN_NAV.map((item) => {
          const active = isAdminNavItemActive(pathname, item);
          return (
            <motion.div
              key={item.href}
              className="flex min-h-[48px] w-[4.75rem] shrink-0 touch-manipulation select-none flex-col"
              whileTap={{ scale: 0.85 }}
              transition={springTap}
            >
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-[48px] w-full flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-center text-[9px] font-medium leading-tight touch-manipulation select-none active:opacity-90",
                  active ? "text-white" : "text-zinc-500"
                )}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center [&_svg]:size-[18px] [&_svg]:shrink-0",
                    active ? "text-white" : "text-zinc-500"
                  )}
                >
                  {item.icon}
                </span>
                <span className="line-clamp-2 w-full break-words hyphens-auto">{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </nav>
  );
}

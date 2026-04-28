"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@repo/ui/lib/utils";
import { getNavItemsForShellRole, isAdminNavItemActive } from "./admin-sidebar";

const springTap = { type: "spring" as const, stiffness: 500, damping: 30 };

export function AdminBottomNav({
  role,
  className,
}: {
  readonly role: string;
  readonly className?: string;
}) {
  const pathname = usePathname();
  const navItems = getNavItemsForShellRole(role);

  return (
    <nav
      role="navigation"
      aria-label="Primary admin"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden",
        className
      )}
    >
      <div className="flex gap-0.5 overflow-x-auto px-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navItems.map((item) => {
          const active = isAdminNavItemActive(pathname, item);
          return (
            <motion.div
              key={item.navId}
              className="flex min-h-[48px] w-[4.75rem] shrink-0 touch-manipulation select-none flex-col"
              whileTap={{ scale: 0.85 }}
              transition={springTap}
            >
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-[48px] w-full flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-center text-[9px] font-medium leading-tight touch-manipulation select-none active:opacity-90",
                  active
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center text-foreground [&_svg]:size-[18px] [&_svg]:shrink-0",
                    !active && "text-muted-foreground"
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

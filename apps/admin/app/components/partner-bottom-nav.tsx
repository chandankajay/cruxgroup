"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Grid3x3, Home } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/sheet";
import {
  getNavItemsForShellRole,
  isShellNavItemActive,
  type NavItem,
} from "./admin-sidebar";

const springTap = { type: "spring" as const, stiffness: 500, damping: 30 };

/** Daily-driver tabs — order matches product priority. */
const PRIMARY_NAV_IDS = [
  "partner-home",
  "partner-walk-in",
  "partner-jobs",
] as const;

/** Insert CRM after Fleet in the “More” grid. */
const CRM_LINK = {
  navId: "partner-crm-customers",
  href: "/customers",
  label: "Customers",
  subtitle: "CRM",
} as const;

function WalkInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function JobsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

type PrimaryTab = NavItem & {
  PrimaryIcon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

export function PartnerBottomNav({ className }: { readonly className?: string }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const partnerNav = useMemo(() => getNavItemsForShellRole("PARTNER"), []);

  const primaryTabs = useMemo((): PrimaryTab[] => {
    const map = new Map(partnerNav.map((n) => [n.navId, n]));
    const tabs: PrimaryTab[] = [];
    for (const id of PRIMARY_NAV_IDS) {
      const item = map.get(id);
      if (!item) continue;
      if (id === "partner-home") {
        tabs.push({ ...item, PrimaryIcon: Home });
      } else if (id === "partner-walk-in") {
        tabs.push({ ...item, PrimaryIcon: WalkInIcon });
      } else {
        tabs.push({ ...item, PrimaryIcon: JobsIcon });
      }
    }
    return tabs;
  }, [partnerNav]);

  const secondaryLinks = useMemo(() => {
    const primarySet = new Set<string>(PRIMARY_NAV_IDS);
    const rest = partnerNav.filter((n) => !primarySet.has(n.navId));
    const out: NavItem[] = [];
    for (const item of rest) {
      out.push(item);
      if (item.navId === "partner-fleet") {
        out.push({
          navId: CRM_LINK.navId,
          href: CRM_LINK.href,
          label: CRM_LINK.label,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          ),
        });
      }
    }
    return out;
  }, [partnerNav]);

  const moreActive = useMemo(
    () =>
      secondaryLinks.some((item) => isShellNavItemActive(pathname, item)),
    [pathname, secondaryLinks]
  );

  return (
    <nav
      role="navigation"
      aria-label="Primary"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden",
        className
      )}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around gap-1 px-2 pt-1">
        {primaryTabs.map(({ PrimaryIcon, ...item }) => {
          const active = isShellNavItemActive(pathname, item);
          return (
            <motion.div
              key={item.navId}
              className="flex min-h-[44px] min-w-0 flex-1 touch-manipulation select-none"
              whileTap={{ scale: 0.85 }}
              transition={springTap}
            >
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-[44px] w-full flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium touch-manipulation select-none active:opacity-90",
                  active
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                <PrimaryIcon
                  className="size-5 shrink-0"
                  strokeWidth={active ? 2.25 : 2}
                  aria-hidden
                />
                <span className="truncate">{item.label}</span>
              </Link>
            </motion.div>
          );
        })}

        <motion.div
          className="flex min-h-[44px] min-w-0 flex-1 touch-manipulation select-none"
          whileTap={{ scale: 0.85 }}
          transition={springTap}
        >
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex min-h-[44px] w-full flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium touch-manipulation select-none active:opacity-90",
                  moreActive ? "text-white" : "text-zinc-500"
                )}
                aria-label="More navigation"
                aria-expanded={moreOpen}
              >
                <Grid3x3 className="size-5 shrink-0" strokeWidth={moreActive ? 2.25 : 2} aria-hidden />
                <span className="truncate">More</span>
              </button>
            </SheetTrigger>
            <SheetContent
              className="flex !h-[60vh] !max-h-[85vh] flex-col rounded-t-xl border-0 bg-background p-0 shadow-xl"
              aria-describedby={undefined}
            >
              <SheetHeader className="shrink-0 border-b border-border px-6 pb-3 pt-2 text-left">
                <SheetTitle className="text-lg font-semibold tracking-tight">
                  Partner workspace
                </SheetTitle>
                <p className="text-sm text-muted-foreground">
                  Fleet, CRM, payroll, and account tools
                </p>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
                <div className="mx-auto grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-3">
                  {secondaryLinks.map((item) => {
                    const active = isShellNavItemActive(pathname, item);
                    const isKyc = item.href.startsWith("/settings/kyc");
                    const crmSubtitle = item.navId === CRM_LINK.navId ? CRM_LINK.subtitle : null;
                    return (
                      <SheetClose asChild key={item.navId}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-4 text-center transition-colors active:bg-accent/90",
                            active
                              ? "border-primary/40 bg-primary/10 text-foreground"
                              : "border-border bg-muted/40 text-foreground hover:bg-accent/50"
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-foreground shadow-sm [&_svg]:size-6",
                              active && "bg-primary/15 text-primary"
                            )}
                          >
                            {item.icon}
                          </span>
                          <span className="text-xs font-semibold leading-tight">{item.label}</span>
                          {crmSubtitle ? (
                            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              {crmSubtitle}
                            </span>
                          ) : isKyc ? (
                            <span className="text-[10px] font-medium text-muted-foreground">
                              Trust Center
                            </span>
                          ) : null}
                        </Link>
                      </SheetClose>
                    );
                  })}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </motion.div>
      </div>
    </nav>
  );
}

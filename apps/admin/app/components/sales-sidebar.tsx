"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@repo/ui/lib/utils";
import { ThemeToggle } from "../../components/theme-toggle";
import { NotificationBell } from "./notification-bell";

const SALES_NAV = [
  { href: "/sales", label: "Performance", exact: true },
  { href: "/sales/leads", label: "Leads", exact: false },
] as const;

function isActive(pathname: string, href: string, exact: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface SalesSidebarProps {
  readonly userName: string | null;
  readonly className?: string;
}

export function SalesSidebar({ userName, className }: SalesSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-screen w-64 shrink-0 flex-col border-r border-border bg-card text-card-foreground",
        className,
      )}
    >
      <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-5">
        <Image
          src="/logo.png"
          alt="Crux Group"
          width={200}
          height={70}
          unoptimized
          className="h-10 w-auto min-w-0 max-w-[9.5rem] flex-1 object-contain object-left"
          priority
        />
        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />
          <span className="inline-flex items-center rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-semibold text-sky-800 dark:text-sky-200">
            Sales
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {SALES_NAV.map((item) => {
          const active = isActive(pathname, item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-11 items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <p className="truncate px-2 text-sm font-medium text-foreground">
          {userName ?? "Sales"}
        </p>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-2 flex min-h-11 w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export function SalesMobileHeader({ userName }: { readonly userName: string | null }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/95 px-3 backdrop-blur lg:hidden">
      <Link href="/sales" aria-label="Sales home">
        <Image
          src="/logo.png"
          alt="Crux Group"
          width={160}
          height={56}
          unoptimized
          className="h-9 w-auto object-contain"
        />
      </Link>
      <div className="flex items-center gap-1">
        <NotificationBell />
        <ThemeToggle />
      </div>
      <nav className="sr-only" aria-label="Sales sections">
        {SALES_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(pathname, item.href, item.exact) ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <span className="sr-only">{userName}</span>
    </header>
  );
}

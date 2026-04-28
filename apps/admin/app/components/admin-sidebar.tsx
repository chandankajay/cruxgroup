"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@repo/ui/lib/utils";
import { ThemeToggle } from "../../components/theme-toggle";
import type { HTMLAttributes, ReactNode } from "react";

/** Roles that use the admin app shell (layout + sidebar). */
export type AppShellRole = "PARTNER" | "ADMIN";

export function toAppShellRole(role: string): AppShellRole {
  return role === "PARTNER" ? "PARTNER" : "ADMIN";
}

export interface NavItem {
  readonly navId: string;
  readonly href: string;
  readonly label: string;
  readonly icon: ReactNode;
}

type NavItemDefinition = NavItem & {
  readonly roles: readonly AppShellRole[];
};

export function isShellNavItemActive(pathname: string, item: Pick<NavItem, "href">): boolean {
  if (item.href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/";
  }
  if (item.href === "/bookings") {
    return pathname === "/bookings";
  }
  if (item.href === "/bookings/new") {
    return pathname === "/bookings/new" || pathname.startsWith("/bookings/new/");
  }
  if (item.href === "/jobs") {
    return pathname === "/jobs" || pathname.startsWith("/jobs/");
  }
  if (item.href === "/customers") {
    return pathname === "/customers" || pathname.startsWith("/customers/");
  }
  if (item.href === "/payroll") {
    return pathname === "/payroll" || pathname.startsWith("/payroll/");
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** @deprecated Use `isShellNavItemActive` — kept for call sites that still pass admin-only paths. */
export function isAdminNavItemActive(pathname: string, item: Pick<NavItem, "href">): boolean {
  return isShellNavItemActive(pathname, item);
}

/** @deprecated Use `isShellNavItemActive`. */
export function isPartnerNavItemActive(pathname: string, item: Pick<NavItem, "href">): boolean {
  return isShellNavItemActive(pathname, item);
}

// ── Icon helpers (inline SVG, no extra dep) ──────────────────────────────────

function Icon({ d, ...rest }: { d: string } & React.SVGProps<SVGSVGElement>) {
  return (
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
      {...rest}
    >
      <path d={d} />
    </svg>
  );
}

const NAV_ITEM_DEFINITIONS: readonly NavItemDefinition[] = [
  // ── Admin (platform) ─────────────────────────────────────────────────────
  {
    navId: "admin-dashboard",
    href: "/dashboard",
    label: "Dashboard",
    roles: ["ADMIN"],
    icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  },
  {
    navId: "admin-partners",
    href: "/partners",
    label: "Partners",
    roles: ["ADMIN"],
    icon: (
      <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    ),
  },
  {
    navId: "admin-kyc",
    href: "/platform-admin/kyc",
    label: "KYC verification queue",
    roles: ["ADMIN"],
    icon: <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  },
  {
    navId: "admin-catalog",
    href: "/equipment",
    label: "Master catalog",
    roles: ["ADMIN"],
    icon: <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
  },
  {
    navId: "admin-bookings-global",
    href: "/bookings",
    label: "Global bookings",
    roles: ["ADMIN"],
    icon: <Icon d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />,
  },
  {
    navId: "admin-settings",
    href: "/settings",
    label: "Settings",
    roles: ["ADMIN"],
    icon: (
      <Icon d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm0-14a6 6 0 1 0 6 6 6 6 0 0 0-6-6z" />
    ),
  },
  // ── Partner OS ─────────────────────────────────────────────────────────────
  {
    navId: "partner-home",
    href: "/dashboard",
    label: "Home",
    roles: ["PARTNER"],
    icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  },
  {
    navId: "partner-walk-in",
    href: "/bookings/new",
    label: "Walk-in booking",
    roles: ["PARTNER"],
    icon: <Icon d="M12 5v14M5 12h14" />,
  },
  {
    navId: "partner-jobs",
    href: "/jobs",
    label: "Live job board",
    roles: ["PARTNER"],
    icon: <Icon d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
  },
  {
    navId: "partner-requests",
    href: "/requests",
    label: "Inbound requests",
    roles: ["PARTNER"],
    icon: (
      <Icon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    ),
  },
  {
    navId: "partner-fleet",
    href: "/fleet",
    label: "Fleet & health",
    roles: ["PARTNER"],
    icon: <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
  },
  {
    navId: "partner-my-bookings",
    href: "/my-bookings",
    label: "My bookings",
    roles: ["PARTNER"],
    icon: <Icon d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />,
  },
  {
    navId: "partner-payroll",
    href: "/payroll",
    label: "Payroll",
    roles: ["PARTNER"],
    icon: <Icon d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
  },
  {
    navId: "partner-service-area",
    href: "/service-area",
    label: "Service area",
    roles: ["PARTNER"],
    icon: (
      <Icon d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
    ),
  },
  {
    navId: "partner-earnings",
    href: "/earnings",
    label: "Earnings",
    roles: ["PARTNER"],
    icon: <Icon d="M3 3v18h18M7 16l4-4 4 4 6-6" />,
  },
  {
    navId: "partner-settings",
    href: "/settings/kyc",
    label: "Settings",
    roles: ["PARTNER"],
    icon: (
      <Icon d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm0-14a6 6 0 1 0 6 6 6 6 0 0 0-6-6z" />
    ),
  },
];

export function getNavItemsForShellRole(role: string): NavItem[] {
  const shell = toAppShellRole(role);
  return NAV_ITEM_DEFINITIONS.filter((def) => def.roles.includes(shell)).map(
    ({ roles: _r, ...item }) => item
  );
}

/** Convenience: admin-only nav (e.g. static imports). Same as `getNavItemsForShellRole("ADMIN")`. */
export const ADMIN_NAV: NavItem[] = getNavItemsForShellRole("ADMIN");

// Role badge shown at the top of the nav
function RoleBadge({ role }: { role: string }) {
  const isPartner = role === "PARTNER";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        isPartner
          ? "bg-amber-500/15 text-amber-800 dark:text-amber-200"
          : "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
      )}
    >
      {isPartner ? "Partner" : "Admin"}
    </span>
  );
}

function UserAvatar({
  name,
  image,
}: {
  name: string | null;
  image: string | null;
}) {
  const initials = name
    ? name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name ?? "User"}
        className="h-8 w-8 rounded-full object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
      {initials}
    </div>
  );
}

interface AdminSidebarProps extends Pick<HTMLAttributes<HTMLElement>, "className"> {
  readonly userName: string | null;
  readonly userEmail: string | null;
  readonly userImage: string | null;
  readonly role: string;
}

export function AdminSidebar({
  userName,
  userEmail,
  userImage,
  role,
  className,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const navItems = getNavItemsForShellRole(role);

  return (
    <aside
      className={cn(
        "flex h-screen w-64 shrink-0 flex-col border-r border-border bg-card text-card-foreground",
        className
      )}
    >
      {/* Logo */}
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
          <RoleBadge role={role} />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive = isShellNavItemActive(pathname, item);

          return (
            <Link
              key={item.navId}
              href={item.href}
              className={cn(
                "flex min-h-11 touch-manipulation select-none items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all lg:min-h-0",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground active:bg-accent/80 active:text-accent-foreground lg:hover:bg-accent/50 lg:hover:text-foreground"
              )}
            >
              <span className="shrink-0 opacity-80">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <UserAvatar name={userName} image={userImage} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {userName ?? "User"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {userEmail ?? ""}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-1 flex min-h-11 w-full touch-manipulation select-none items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors active:bg-accent/80 active:text-accent-foreground lg:hover:bg-accent/50 lg:hover:text-foreground"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

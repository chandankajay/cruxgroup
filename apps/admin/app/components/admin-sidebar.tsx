"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@repo/ui/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

export function isAdminNavItemActive(pathname: string, item: NavItem): boolean {
  if (item.href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
  if (item.href === "/bookings") return pathname === "/bookings";
  if (item.href === "/bookings/new") return pathname === "/bookings/new";
  if (item.href === "/jobs") return pathname === "/jobs";
  if (item.href === "/customers") return pathname === "/customers" || pathname.startsWith("/customers/");
  if (item.href === "/payroll") return pathname === "/payroll";
  return pathname.startsWith(item.href);
}

export function isPartnerNavItemActive(pathname: string, item: NavItem): boolean {
  if (item.href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
  return pathname.startsWith(item.href);
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

export const ADMIN_NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    ),
  },
  {
    href: "/partners",
    label: "Partners",
    icon: (
      <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    ),
  },
  {
    href: "/platform-admin/kyc",
    label: "KYC Approvals",
    icon: (
      <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    ),
  },
  {
    href: "/equipment",
    label: "All Equipment",
    icon: (
      <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    ),
  },
  {
    href: "/bookings",
    label: "Global Bookings",
    icon: (
      <Icon d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    ),
  },
  {
    href: "/bookings/new",
    label: "Walk-in booking",
    icon: (
      <Icon d="M12 5v14M5 12h14" />
    ),
  },
  {
    href: "/jobs",
    label: "Live jobs",
    icon: (
      <Icon d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    ),
  },
  {
    href: "/customers",
    label: "Customers",
    icon: (
      <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm12-4v6M21 7h-6" />
    ),
  },
  {
    href: "/payroll",
    label: "Payroll",
    icon: (
      <Icon d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <Icon d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm0-14a6 6 0 1 0 6 6 6 6 0 0 0-6-6z" />
    ),
  },
];

export const PARTNER_NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "Home",
    icon: (
      <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    ),
  },
  {
    href: "/fleet",
    label: "My Fleet",
    icon: (
      <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    ),
  },
  {
    href: "/my-bookings",
    label: "My Bookings",
    icon: (
      <Icon d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    ),
  },
  {
    href: "/service-area",
    label: "Service Area",
    icon: (
      <Icon d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
    ),
  },
  {
    href: "/earnings",
    label: "Earnings",
    icon: (
      <Icon d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    ),
  },
];

// Role badge shown at the top of the nav
function RoleBadge({ role }: { role: string }) {
  const isPartner = role === "PARTNER";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        isPartner
          ? "bg-amber-500/20 text-amber-300"
          : "bg-emerald-500/20 text-emerald-300"
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
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-orange text-xs font-bold text-white">
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
  const navItems = role === "PARTNER" ? PARTNER_NAV : ADMIN_NAV;

  return (
    <aside
      className={cn(
        "flex h-screen w-64 shrink-0 flex-col bg-charcoal text-white",
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
        <Image
          src="/logo.png"
          alt="Crux Group"
          width={200}
          height={70}
          unoptimized
          className="h-10 w-auto max-w-[9.5rem] object-contain object-left"
          priority
        />
        <RoleBadge role={role} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            role === "PARTNER"
              ? isPartnerNavItemActive(pathname, item)
              : isAdminNavItemActive(pathname, item);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-11 touch-manipulation select-none items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all lg:min-h-0",
                isActive
                  ? "bg-brand-orange text-white shadow-sm"
                  : "text-gray-400 active:bg-white/10 active:text-white lg:hover:bg-white/5 lg:hover:text-white"
              )}
            >
              <span className="shrink-0 opacity-80">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <UserAvatar name={userName} image={userImage} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {userName ?? "User"}
            </p>
            <p className="truncate text-xs text-gray-400">
              {userEmail ?? ""}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-1 flex min-h-11 w-full touch-manipulation select-none items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors active:bg-white/10 active:text-white lg:hover:bg-white/5 lg:hover:text-white"
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

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@repo/ui/lib/utils";
import { useLabels } from "@repo/ui/dictionary-provider";

interface NavItem {
  href: string;
  labelKey: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: "/", labelKey: "NAV_DASHBOARD", icon: "📊" },
  { href: "/equipment", labelKey: "NAV_EQUIPMENT", icon: "🏗️" },
  { href: "/bookings", labelKey: "NAV_BOOKINGS", icon: "📋" },
  { href: "/partners", labelKey: "NAV_PARTNERS", icon: "🤝" },
  { href: "/areas", labelKey: "NAV_AREAS", icon: "📍" },
];

interface AdminSidebarProps {
  readonly userName: string | null;
  readonly userEmail: string | null;
  readonly userImage: string | null;
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

export function AdminSidebar({ userName, userEmail, userImage }: AdminSidebarProps) {
  const pathname = usePathname();
  const t = useLabels();

  return (
    <aside className="flex h-screen w-64 flex-col bg-charcoal text-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-charcoal-light px-6">
        <Image src="/logo.png" alt="Crux Group" width={120} height={34} priority />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-orange text-white"
                  : "text-gray-300 hover:bg-charcoal-light hover:text-white"
              )}
            >
              <span className="text-base">{item.icon}</span>
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-charcoal-light p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <UserAvatar name={userName} image={userImage} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {userName ?? "Admin"}
            </p>
            <p className="truncate text-xs text-gray-400">
              {userEmail ?? ""}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-charcoal-light hover:text-white"
        >
          <span>↩</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

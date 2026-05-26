"use client";

import { useState } from "react";
import type { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { SideDrawer } from "./side-drawer";
import { LocationHeader } from "./location-header";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive =
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <Link
      href={href}
      style={{
        fontSize: "0.9rem",
        fontWeight: 500,
        color: isActive ? "#d45800" : "#475569",
        textDecoration: "none",
        padding: "4px 0",
        borderBottom: isActive ? "2px solid #d45800" : "2px solid transparent",
        transition: "color 0.15s, border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = "#d45800";
          e.currentTarget.style.borderBottomColor = "#d45800";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = "#475569";
          e.currentTarget.style.borderBottomColor = "transparent";
        }
      }}
    >
      {label}
    </Link>
  );
}

export function NavigationHeader({
  session,
}: {
  readonly session: Session | null;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <header
        className="hidden md:flex"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 72,
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          zIndex: 50,
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, minWidth: 0, flex: 1 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <Image
              src="/logo.png"
              alt="Crux Group"
              width={160}
              height={80}
              unoptimized
              priority
              style={{ objectFit: "contain", mixBlendMode: "multiply" }}
            />
          </Link>

          {/* Location selector in top bar */}
          <div style={{ maxWidth: 320, minWidth: 0 }}>
            <LocationHeader />
          </div>
        </div>

        <nav style={{ display: "flex", gap: 32, alignItems: "center", flexShrink: 0 }}>
          <NavLink href="/" label="Equipment" />
          {session?.user ? (
            <>
              <NavLink href="/dashboard" label="My Bookings" />
              <NavLink href="/profile" label="Profile" />
            </>
          ) : (
            <NavLink href="/login" label="Sign in" />
          )}
        </nav>

        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            backgroundColor: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginLeft: 16,
          }}
          aria-label="Menu"
        >
          <Menu size={20} color="#475569" />
        </button>
      </header>

      <SideDrawer
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        session={session}
      />
    </>
  );
}

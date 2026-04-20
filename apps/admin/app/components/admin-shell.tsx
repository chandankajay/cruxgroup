"use client";

import type { ReactNode } from "react";
import { useLayoutEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "./admin-sidebar";
import { PageTransition } from "./page-transition";
import { PartnerBottomNav } from "./partner-bottom-nav";
import { PartnerMobileHeader } from "./partner-mobile-header";

interface AdminShellProps {
  readonly children: ReactNode;
  readonly isAuthenticated: boolean;
  readonly userName: string | null;
  readonly userEmail: string | null;
  readonly userImage: string | null;
  readonly role: string;
  /** For PARTNER users only: whether a `Partner` row exists (onboarding complete). */
  readonly hasPartner: boolean;
}

export function AdminShell({
  children,
  isAuthenticated,
  userName,
  userEmail,
  userImage,
  role,
  hasPartner,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  useLayoutEffect(() => {
    if (!isAuthenticated || role !== "PARTNER") return;
    if (hasPartner) return;
    if (pathname === "/onboarding") return;
    router.replace("/onboarding");
  }, [isAuthenticated, role, hasPartner, pathname, router]);

  useLayoutEffect(() => {
    if (!isAuthenticated || role !== "PARTNER") return;
    if (!hasPartner) return;
    if (pathname !== "/onboarding") return;
    router.replace("/dashboard");
  }, [isAuthenticated, role, hasPartner, pathname, router]);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  if (pathname === "/onboarding") {
    return (
      <div className="min-h-screen overflow-y-auto bg-gray-50 p-6 md:p-10">{children}</div>
    );
  }

  const isPartner = role === "PARTNER";

  if (isPartner) {
    return (
      <div className="flex min-h-dvh flex-col bg-gray-50 lg:h-screen lg:flex-row lg:overflow-hidden">
        <AdminSidebar
          className="hidden lg:flex"
          userName={userName}
          userEmail={userEmail}
          userImage={userImage}
          role={role}
        />
        <div className="relative flex min-h-dvh flex-1 flex-col lg:min-h-0">
          <PartnerMobileHeader
            userName={userName}
            userEmail={userEmail}
            userImage={userImage}
          />
          <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-20 pt-0 lg:px-8 lg:pb-8 lg:pt-8">
            <PageTransition>{children}</PageTransition>
          </main>
          <PartnerBottomNav />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar
        userName={userName}
        userEmail={userEmail}
        userImage={userImage}
        role={role}
      />
      <main className="min-h-0 flex-1 overflow-y-auto bg-gray-50 p-8">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}

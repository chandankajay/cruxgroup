"use client";

import type { ReactNode } from "react";
import { useLayoutEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "./admin-sidebar";
import { PageWrapper } from "./page-wrapper";
import { PartnerBottomNav } from "./partner-bottom-nav";
import { PartnerMobileHeader } from "./partner-mobile-header";
import { AdminBottomNav } from "./admin-bottom-nav";
import { AdminMobileHeader } from "./admin-mobile-header";
import { isBookingResponseMagicLink } from "../../lib/booking-response-routes";
import { isChooseRolePath } from "../../lib/role-routes";
import { SalesBottomNav } from "./sales-bottom-nav";
import { SalesMobileHeader, SalesSidebar } from "./sales-sidebar";
import { NotificationBell } from "./notification-bell";

interface AdminShellProps {
  readonly children: ReactNode;
  readonly isAuthenticated: boolean;
  readonly userName: string | null;
  readonly userEmail: string | null;
  readonly userImage: string | null;
  readonly role: string;
  /** For PARTNER users: profile created and terms accepted (full onboarding). */
  readonly onboardingComplete: boolean;
}

export function AdminShell({
  children,
  isAuthenticated,
  userName,
  userEmail,
  userImage,
  role,
  onboardingComplete,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  useLayoutEffect(() => {
    if (!isAuthenticated || role !== "PARTNER") return;
    if (onboardingComplete) return;
    if (pathname === "/onboarding") return;
    if (isBookingResponseMagicLink(pathname)) return;
    router.replace("/onboarding");
  }, [isAuthenticated, role, onboardingComplete, pathname, router]);

  useLayoutEffect(() => {
    if (!isAuthenticated || role !== "PARTNER") return;
    if (!onboardingComplete) return;
    if (pathname !== "/onboarding") return;
    router.replace("/dashboard");
  }, [isAuthenticated, role, onboardingComplete, pathname, router]);

  if (!isAuthenticated || isBookingResponseMagicLink(pathname)) {
    return <>{children}</>;
  }

  if (isChooseRolePath(pathname)) {
    return <>{children}</>;
  }

  if (pathname === "/onboarding") {
    return (
      <div className="min-h-screen overflow-y-auto bg-background p-6 md:p-10">{children}</div>
    );
  }

  const isPartner = role === "PARTNER";
  const isSales = role === "SALES";

  if (isSales) {
    return (
      <div className="flex min-h-dvh flex-col bg-background lg:h-screen lg:flex-row lg:overflow-hidden">
        <SalesSidebar className="hidden lg:flex" userName={userName} />
        <div className="relative flex min-h-dvh flex-1 flex-col lg:min-h-0">
          <SalesMobileHeader userName={userName} />
          <div className="hidden items-center justify-end gap-2 border-b border-border px-6 py-2 lg:flex">
            <NotificationBell />
          </div>
          <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-20 pt-4 lg:px-8 lg:pb-8 lg:pt-6">
            <PageWrapper>{children}</PageWrapper>
          </main>
          <SalesBottomNav />
        </div>
      </div>
    );
  }

  if (isPartner) {
    return (
      <div className="flex min-h-dvh flex-col bg-background lg:h-screen lg:flex-row lg:overflow-hidden">
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
            <PageWrapper>{children}</PageWrapper>
          </main>
          <PartnerBottomNav />
        </div>
      </div>
    );
  }

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
        <AdminMobileHeader
          role={role}
          userName={userName}
          userEmail={userEmail}
          userImage={userImage}
        />
        <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-20 pt-0 lg:px-8 lg:pb-8 lg:pt-8">
          <PageWrapper>{children}</PageWrapper>
        </main>
          <AdminBottomNav role={role} />
      </div>
    </div>
  );
}

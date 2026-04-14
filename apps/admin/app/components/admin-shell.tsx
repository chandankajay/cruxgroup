import type { ReactNode } from "react";
import { AdminSidebar } from "./admin-sidebar";

interface AdminShellProps {
  readonly children: ReactNode;
  readonly isAuthenticated: boolean;
  readonly userName: string | null;
  readonly userEmail: string | null;
  readonly userImage: string | null;
}

export function AdminShell({
  children,
  isAuthenticated,
  userName,
  userEmail,
  userImage,
}: AdminShellProps) {
  if (!isAuthenticated) {
    // Unauthenticated — render bare children (login page)
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar
        userName={userName}
        userEmail={userEmail}
        userImage={userImage}
      />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        {children}
      </main>
    </div>
  );
}

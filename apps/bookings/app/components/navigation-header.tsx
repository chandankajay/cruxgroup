import type { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";

export function NavigationHeader({
  session,
}: {
  readonly session: Session | null;
}) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-navy/20 bg-background/95 text-brand-navy backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: "8px", paddingBottom: "0px" }}
      >
        <Link href="/" className="flex items-end">
          <Image
            src="/logo.png"
            alt="Crux Group"
            width={200}
            height={72}
            priority
            style={{
              width: "auto",
              height: "auto",
              maxHeight: "80px",
              marginBottom: "-12px",
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.18))",
            }}
          />
        </Link>
        <div className="flex items-center gap-3 pb-2 text-sm font-semibold sm:gap-4">
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="text-brand-navy underline-offset-4 transition-colors hover:text-amber-700 hover:underline"
              >
                My bookings
              </Link>
              <Link
                href="/profile"
                className="text-brand-navy underline-offset-4 transition-colors hover:text-amber-700 hover:underline"
              >
                Profile
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="text-brand-navy underline-offset-4 transition-colors hover:text-amber-700 hover:underline"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

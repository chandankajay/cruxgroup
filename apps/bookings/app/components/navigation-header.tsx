import Image from "next/image";
import Link from "next/link";

export function NavigationHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-navy/20 bg-background/95 text-brand-navy backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" style={{ paddingTop: "8px", paddingBottom: "0px" }}>
        <Link href="/" className="flex items-end">
          {/* Logo overflows the bottom border for a trendy 3-D lift effect */}
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
      </nav>
    </header>
  );
}

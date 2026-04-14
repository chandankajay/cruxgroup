import Image from "next/image";
import Link from "next/link";

export function NavigationHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-navy/20 bg-background/95 text-brand-navy backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Crux Group"
            width={140}
            height={40}
            priority
            style={{ width: "auto", height: "auto", maxHeight: "60px" }}
          />
        </Link>
      </nav>
    </header>
  );
}

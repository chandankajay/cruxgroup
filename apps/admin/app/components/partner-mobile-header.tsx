"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Drawer } from "vaul";
import { Menu, MapPin, Settings, LogOut } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

interface PartnerMobileHeaderProps {
  readonly className?: string;
  readonly userName: string | null;
  readonly userEmail: string | null;
  readonly userImage: string | null;
}

export function PartnerMobileHeader({
  className,
  userName,
  userEmail,
  userImage,
}: PartnerMobileHeaderProps) {
  const [open, setOpen] = useState(false);

  const initials = userName
    ? userName
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 lg:hidden",
        className
      )}
    >
      <Link
        href="/dashboard"
        className="flex min-h-11 min-w-11 touch-manipulation select-none items-center active:opacity-90"
        aria-label="Home"
      >
        <Image
          src="/logo.png"
          alt="Crux Group"
          width={200}
          height={70}
          unoptimized
          className="h-9 w-auto max-w-[8.5rem] object-contain object-left"
          priority
        />
      </Link>

      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Trigger asChild>
          <button
            type="button"
            className="flex size-11 touch-manipulation select-none items-center justify-center rounded-xl text-zinc-100 active:bg-zinc-800"
            aria-label="Open menu"
          >
            <Menu className="size-6" strokeWidth={2} aria-hidden />
          </button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[60] bg-black/60" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[70] flex max-h-[85vh] flex-col rounded-t-3xl bg-zinc-900 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] outline-none">
            <div className="mx-auto mb-4 h-1 w-10 shrink-0 rounded-full bg-zinc-600" aria-hidden />
            <div className="mb-6 flex items-center gap-3 border-b border-zinc-800 pb-4">
              {userImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userImage}
                  alt=""
                  className="size-12 shrink-0 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-orange text-sm font-bold text-white">
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1 select-none">
                <p className="truncate font-semibold text-zinc-100">{userName ?? "Partner"}</p>
                <p className="truncate text-sm text-zinc-400">{userEmail ?? ""}</p>
              </div>
            </div>
            <nav className="flex flex-col gap-1 overflow-y-auto">
              <Drawer.Close asChild>
                <Link
                  href="/service-area"
                  className="flex min-h-14 touch-manipulation select-none items-center gap-3 rounded-xl px-3 text-sm font-medium text-zinc-200 active:bg-zinc-800"
                >
                  <MapPin className="size-5 text-amber-500" aria-hidden />
                  Service Area
                </Link>
              </Drawer.Close>
              <Drawer.Close asChild>
                <Link
                  href="/settings/kyc"
                  className="flex min-h-14 touch-manipulation select-none items-center gap-3 rounded-xl px-3 text-sm font-medium text-zinc-200 active:bg-zinc-800"
                >
                  <Settings className="size-5 text-amber-500" aria-hidden />
                  Trust Center / KYC
                </Link>
              </Drawer.Close>
              <button
                type="button"
                className="mt-2 flex min-h-14 touch-manipulation select-none items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-zinc-400 active:bg-zinc-800"
                onClick={() => {
                  setOpen(false);
                  void signOut({ callbackUrl: "/login" });
                }}
              >
                <LogOut className="size-5" aria-hidden />
                Sign out
              </button>
            </nav>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </header>
  );
}

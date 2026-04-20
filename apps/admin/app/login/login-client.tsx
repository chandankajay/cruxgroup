"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Shield } from "lucide-react";
import { CruxLoginShell } from "@repo/ui/crux-login-shell";
import { GoogleSignInButton } from "./google-sign-in-button";
import { PhoneOtpForm } from "./phone-otp-form";

function TrustFooter() {
  const item =
    "flex flex-1 flex-col items-center gap-1 text-center text-gray-500";
  const sep = "hidden text-gray-600 sm:block sm:px-1";
  return (
    <div className="mt-6 flex items-stretch border-t border-white/10 pt-5">
      <div className={item}>
        <Shield className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
        <span className="text-[10px] font-medium leading-tight tracking-wide">Verified Fleet</span>
      </div>
      <span className={sep} aria-hidden>
        |
      </span>
      <div className={item}>
        <Clock className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
        <span className="text-[10px] font-medium leading-tight tracking-wide">2hr Response</span>
      </div>
      <span className={sep} aria-hidden>
        |
      </span>
      <div className={item}>
        <MapPin className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
        <span className="text-[10px] font-medium leading-tight tracking-wide">50km Coverage</span>
      </div>
    </div>
  );
}

const ADMIN_SUBHEAD =
  "Operations console for fleet partners and platform administrators — secure, auditable access.";

interface LoginClientProps {
  readonly isAccessDenied: boolean;
  readonly isConfiguration: boolean;
  readonly googleLoginAction: () => Promise<void>;
}

export function LoginClient({ isAccessDenied, isConfiguration, googleLoginAction }: LoginClientProps) {
  const showError = isAccessDenied || isConfiguration;

  const logo = (
    <Link
      href="/"
      className="inline-block outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-amber-500/80"
      aria-label="Crux Group home"
    >
      {/* unoptimized: serve /logo.png directly — avoids /_next/image 400s on some PNGs in admin dev/prod */}
      <Image
        src="/logo.png"
        alt="Crux Group"
        width={400}
        height={140}
        unoptimized
        className="h-24 w-auto max-w-[min(92vw,400px)] drop-shadow-[0_12px_40px_rgba(0,0,0,0.5)] sm:h-28 lg:h-32 xl:h-[8.5rem]"
        priority
      />
    </Link>
  );

  const headline = (
    <>
      <span className="text-amber-500">Crux Group</span> Admin
    </>
  );

  const card = (
    <div className="rounded-2xl border border-white/10 bg-black/55 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:rounded-3xl sm:p-8">
      {showError ? (
        <div
          className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-950/50 px-4 py-3 text-left"
          role="alert"
        >
          <span className="text-lg" aria-hidden>
            ⚠️
          </span>
          <div>
            <p className="text-sm font-semibold text-red-200">
              {isAccessDenied ? "Access Denied" : "Sign-in Error"}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-red-300/90">
              {isAccessDenied
                ? "Your account is not authorised. Contact the system administrator."
                : "Something went wrong. Please try again."}
            </p>
          </div>
        </div>
      ) : null}

      <div className="mb-3">
        <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">Admin Login</p>
        <GoogleSignInButton action={googleLoginAction} />
      </div>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs font-medium text-gray-400">or Partner login</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <PhoneOtpForm />
      <TrustFooter />

      <p className="mt-6 text-center text-[11px] leading-relaxed text-gray-500">
        Admin access requires a @cruxgroup.in Google account.
        <br />
        Partners sign in with their registered phone number.
      </p>
    </div>
  );

  return (
    <CruxLoginShell logo={logo} headline={headline} subheadline={ADMIN_SUBHEAD}>
      {card}
    </CruxLoginShell>
  );
}

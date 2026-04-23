"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Clock, MapPin, Shield } from "lucide-react";
import { CruxLoginShell } from "@repo/ui/crux-login-shell";
import { useLabels } from "@repo/ui/dictionary-provider";
import { sendOtpAction, signInWithCredentialsAction } from "./actions";
import { PhoneStep } from "./features/phone-step";
import { OtpStep } from "./features/otp-step";

type Step = "phone" | "otp";

function TrustFooter() {
  const item =
    "flex flex-1 flex-col items-center gap-1 text-center text-gray-500";
  const sep = "hidden text-gray-600 sm:block sm:px-1";
  return (
    <div className="mt-6 flex items-stretch border-t border-white/10 pt-5">
      <div className={item}>
        <Shield className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
        <span className="text-[10px] font-medium leading-tight tracking-wide">
          Verified Fleet
        </span>
      </div>
      <span className={sep} aria-hidden>
        |
      </span>
      <div className={item}>
        <Clock className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
        <span className="text-[10px] font-medium leading-tight tracking-wide">
          2hr Response
        </span>
      </div>
      <span className={sep} aria-hidden>
        |
      </span>
      <div className={item}>
        <MapPin className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
        <span className="text-[10px] font-medium leading-tight tracking-wide">
          50km Coverage
        </span>
      </div>
    </div>
  );
}

const BOOKINGS_SUBHEAD =
  "The largest heavy machinery fleet in Telangana, at your fingertips.";

export default function LoginPage() {
  const t = useLabels();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);

  async function handleSendOtp(phoneNumber: string) {
    setIsLoading(true);
    setError(undefined);
    const sent = await sendOtpAction(phoneNumber);
    setIsLoading(false);
    if (!sent.success) {
      setError(
        sent.error === "ACCOUNT_LOCKED"
          ? "Too many failed attempts. Please wait 15 minutes before requesting a new code."
          : t("LOGIN_ERROR_SEND"),
      );
      return;
    }
    setPhone(phoneNumber);
    setStep("otp");
  }

  async function handleVerifyOtp(code: string) {
    setIsLoading(true);
    setError(undefined);
    const result = await signInWithCredentialsAction(phone, code);
    if (!result.ok) {
      setError(t("LOGIN_ERROR_VERIFY"));
      setIsLoading(false);
    } else {
      setSuccess(true);
      await new Promise((r) => setTimeout(r, 900));
      window.location.assign("/");
    }
  }

  function handleBack() {
    setStep("phone");
    setError(undefined);
  }

  const logo = (
    <Link href="/" className="inline-block outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-amber-500/80" aria-label="Crux Group home">
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
      <span className="text-amber-500">Powering</span> Your Projects
    </>
  );

  if (success) {
    return (
      <main className="relative flex h-[100dvh] max-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4">
        <div
          className="absolute inset-0 z-0 bg-zinc-950 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/loginbg.jpg')" }}
        />
        <div className="absolute inset-0 z-[1] bg-black/50 backdrop-blur-[2px]" />
        <div className="relative z-10 flex max-w-md flex-col items-center gap-4 rounded-3xl border border-white/10 bg-black/60 px-10 py-12 shadow-2xl backdrop-blur-xl">
          <div
            className="h-12 w-12 animate-spin rounded-full border-[3px] border-amber-500/30 border-t-amber-500"
            aria-hidden
          />
          <p className="text-center text-lg font-extrabold tracking-tight text-white">
            Success! Loading Fleet…
          </p>
        </div>
      </main>
    );
  }

  const card = (
    <div className="rounded-2xl border border-white/10 bg-black/55 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:rounded-3xl sm:p-8">
      <AnimatePresence mode="wait">
        {step === "phone" ? (
          <PhoneStep key="phone" onSubmit={handleSendOtp} isLoading={isLoading} />
        ) : (
          <OtpStep
            key="otp"
            phone={phone}
            onSubmit={handleVerifyOtp}
            onBack={handleBack}
            isLoading={isLoading}
            error={error}
          />
        )}
      </AnimatePresence>
      <TrustFooter />
    </div>
  );

  const belowFold =
    process.env["NEXT_PUBLIC_NODE_ENV"] === "development" ? (
      <p className="text-center text-xs text-gray-500">
        Dev OTP{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-amber-400/90">112233</code>
      </p>
    ) : null;

  return (
    <CruxLoginShell
      logo={logo}
      headline={headline}
      subheadline={BOOKINGS_SUBHEAD}
      belowFold={belowFold}
    >
      {card}
    </CruxLoginShell>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Clock, MapPin, Shield } from "lucide-react";
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
    await sendOtpAction(phoneNumber);
    setIsLoading(false);
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

  if (success) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
        <div
          className="absolute inset-0 z-0 bg-zinc-950 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/loginbg.jpg')" }}
        />
        <div className="absolute inset-0 z-[1] bg-black/40 backdrop-blur-[2px]" />
        <div className="relative z-10 flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-black/60 px-10 py-12 shadow-2xl backdrop-blur-xl">
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

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Cinematic background — add `public/loginbg.jpg` for full effect */}
      <div
        className="absolute inset-0 z-0 bg-zinc-950 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/loginbg.jpg')" }}
      />
      <div className="absolute inset-0 z-[1] bg-black/40 backdrop-blur-[2px]" />

      {/* Logo */}
      <Link
        href="/"
        className="absolute left-4 top-4 z-20 sm:left-6 sm:top-6"
        aria-label="Crux Group home"
      >
        <Image
          src="/logo.png"
          alt="Crux Group"
          width={160}
          height={56}
          className="h-10 w-auto drop-shadow-lg sm:h-12"
          priority
        />
      </Link>

      {/* Centered column: hook + card */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex w-full max-w-md flex-col items-center">
          {/* Heading */}
          <div className="mb-8 w-full text-center sm:mb-10">
            <h1 className="text-balance font-extrabold tracking-tight text-white drop-shadow-md [text-shadow:0_2px_24px_rgba(0,0,0,0.45)] sm:text-4xl text-3xl">
              <span className="text-amber-500" style={{ color: "#F59E0B" }}>
                Powering
              </span>{" "}
              Your Projects
            </h1>
            <p className="mt-3 text-pretty text-sm font-medium tracking-wide text-gray-300 sm:text-base">
              The largest heavy machinery fleet in Telangana, at your
              fingertips.
            </p>
          </div>

          {/* Glass card */}
          <div className="w-full rounded-3xl border border-white/10 bg-black/60 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <AnimatePresence mode="wait">
              {step === "phone" ? (
                <PhoneStep
                  key="phone"
                  onSubmit={handleSendOtp}
                  isLoading={isLoading}
                />
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

          {process.env["NEXT_PUBLIC_NODE_ENV"] === "development" && (
            <p className="mt-4 text-center text-xs text-gray-500">
              Dev OTP{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-amber-400/90">
                112233
              </code>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

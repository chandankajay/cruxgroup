"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { useLabels } from "@repo/ui/dictionary-provider";
import { sendOtpAction, verifyOtpAction } from "./actions";
import { PhoneStep } from "./features/phone-step";
import { OtpStep } from "./features/otp-step";

type Step = "phone" | "otp";

export default function LoginPage() {
  const t = useLabels();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  async function handleSendOtp(phoneNumber: string) {
    setIsLoading(true);
    setError(undefined);
    const result = await sendOtpAction(phoneNumber);
    setIsLoading(false);

    if (result.success) {
      setPhone(phoneNumber);
      setStep("otp");
    } else {
      setError(t("LOGIN_ERROR_SEND"));
    }
  }

  async function handleVerifyOtp(code: string) {
    setIsLoading(true);
    setError(undefined);
    const result = await verifyOtpAction(phone, code);

    if (result.verified) {
      await signIn("phone-otp", { phone, callbackUrl: "/" });
    } else {
      setError(t("LOGIN_ERROR_VERIFY"));
      setIsLoading(false);
    }
  }

  function handleBack() {
    setStep("phone");
    setError(undefined);
  }

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-brand-orange">
              {t("LOGIN_TITLE")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {step === "phone" ? (
                <PhoneStep
                  onSubmit={handleSendOtp}
                  isLoading={isLoading}
                />
              ) : (
                <OtpStep
                  phone={phone}
                  onSubmit={handleVerifyOtp}
                  onBack={handleBack}
                  isLoading={isLoading}
                  error={error}
                />
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
        {process.env["NEXT_PUBLIC_NODE_ENV"] === "development" && (
          <p className="text-center text-xs text-muted-foreground">
            Dev Note: Use <code className="font-mono font-semibold">123456</code> for testing
          </p>
        )}
      </div>
    </section>
  );
}

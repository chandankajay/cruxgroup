"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { useLabels } from "@repo/ui/dictionary-provider";

interface OtpStepProps {
  readonly phone: string;
  readonly onSubmit: (code: string) => void;
  readonly onBack: () => void;
  readonly isLoading: boolean;
  readonly error?: string;
}

export function OtpStep({ phone, onSubmit, onBack, isLoading, error }: OtpStepProps) {
  const t = useLabels();
  const [code, setCode] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length === 6) {
      onSubmit(code);
    }
  }

  return (
    <motion.form
      key="otp-step"
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="otp">{t("LOGIN_OTP_LABEL")}</Label>
        <p className="text-sm text-muted-foreground">
          {t("LOGIN_OTP_SENT_TO")} {phone}
        </p>
        <Input
          id="otp"
          type="text"
          inputMode="numeric"
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          maxLength={6}
          autoFocus
          required
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={code.length !== 6 || isLoading}
      >
        {t("LOGIN_VERIFY_OTP")}
      </Button>
      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {t("LOGIN_CHANGE_PHONE")}
      </button>
    </motion.form>
  );
}

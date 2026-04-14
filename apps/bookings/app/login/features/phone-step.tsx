"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { useLabels } from "@repo/ui/dictionary-provider";

interface PhoneStepProps {
  readonly onSubmit: (phone: string) => void;
  readonly isLoading: boolean;
}

export function PhoneStep({ onSubmit, isLoading }: PhoneStepProps) {
  const t = useLabels();
  const [phone, setPhone] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (phone.length >= 10) {
      onSubmit(phone);
    }
  }

  return (
    <motion.form
      key="phone-step"
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -40, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="phone">{t("LOGIN_PHONE_LABEL")}</Label>
        <Input
          id="phone"
          type="tel"
          inputMode="numeric"
          placeholder={t("LOGIN_PHONE_PLACEHOLDER")}
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          maxLength={15}
          required
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={phone.length < 10 || isLoading}
      >
        {t("LOGIN_SEND_OTP")}
      </Button>
    </motion.form>
  );
}

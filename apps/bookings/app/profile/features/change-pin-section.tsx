"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { changePinAction, changePinWithOtpAction } from "../actions";

export function ChangePinSection() {
  const [pending, startTransition] = useTransition();
  const [useOtp, setUseOtp] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [otp, setOtp] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = useOtp
        ? await changePinWithOtpAction(otp, newPin, confirmPin)
        : await changePinAction(currentPin, newPin, confirmPin);

      if (!res.ok) {
        const messages: Record<string, string> = {
          NOT_SIGNED_IN: "Please sign in again.",
          MISMATCH: "New PINs do not match.",
          WEAK_PIN: "Choose a stronger PIN — avoid sequences like 1234.",
          WRONG_PIN: "Current PIN is incorrect.",
          LOCKED: "Too many attempts. Try again after 15 minutes or use OTP.",
          INVALID_OTP: "Invalid or expired OTP.",
          INVALID: "Could not update PIN.",
        };
        toast.error(messages[res.error] ?? "Could not update PIN.");
        return;
      }
      toast.success("PIN updated.");
      setCurrentPin("");
      setOtp("");
      setNewPin("");
      setConfirmPin("");
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto flex max-w-lg flex-col gap-4 rounded-2xl border border-brand-navy/15 bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-lg font-bold text-brand-navy">Quick login PIN</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Change your 4-digit PIN used for phone login.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-brand-navy">
        <input
          type="checkbox"
          checked={useOtp}
          onChange={(e) => setUseOtp(e.target.checked)}
          className="rounded border-brand-navy/30"
        />
        I forgot my current PIN — verify with OTP instead
      </label>

      {useOtp ? (
        <div>
          <label htmlFor="pin-otp" className="mb-1.5 block text-sm font-semibold text-brand-navy">
            WhatsApp OTP
          </label>
          <input
            id="pin-otp"
            inputMode="numeric"
            maxLength={4}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="w-full rounded-lg border border-brand-navy/20 px-3 py-2.5 tabular-nums text-brand-navy outline-none focus:ring-2 focus:ring-brand-navy/20"
            required
          />
        </div>
      ) : (
        <div>
          <label htmlFor="current-pin" className="mb-1.5 block text-sm font-semibold text-brand-navy">
            Current PIN
          </label>
          <input
            id="current-pin"
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={currentPin}
            onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="w-full rounded-lg border border-brand-navy/20 px-3 py-2.5 tabular-nums text-brand-navy outline-none focus:ring-2 focus:ring-brand-navy/20"
            required
          />
        </div>
      )}

      <div>
        <label htmlFor="new-pin" className="mb-1.5 block text-sm font-semibold text-brand-navy">
          New PIN
        </label>
        <input
          id="new-pin"
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={newPin}
          onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          className="w-full rounded-lg border border-brand-navy/20 px-3 py-2.5 tabular-nums text-brand-navy outline-none focus:ring-2 focus:ring-brand-navy/20"
          required
        />
      </div>

      <div>
        <label htmlFor="confirm-pin" className="mb-1.5 block text-sm font-semibold text-brand-navy">
          Confirm new PIN
        </label>
        <input
          id="confirm-pin"
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          className="w-full rounded-lg border border-brand-navy/20 px-3 py-2.5 tabular-nums text-brand-navy outline-none focus:ring-2 focus:ring-brand-navy/20"
          required
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-brand-navy px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
      >
        {pending ? "Updating…" : "Update PIN"}
      </button>
    </form>
  );
}

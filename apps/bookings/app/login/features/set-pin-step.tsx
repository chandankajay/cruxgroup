"use client";

import { motion } from "framer-motion";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { DigitCodeInput } from "./digit-code-input";

const ease = [0.16, 1, 0.3, 1] as const;
const SHARED_DEVICE_WARNING =
  "Don't set a PIN if others also use this phone or browser. Anyone who knows your PIN can access your account.";

interface SetPinStepProps {
  readonly onSubmit: (pin: string, confirmPin: string) => void;
  readonly isLoading: boolean;
  readonly error?: string;
  readonly pinCells: string[];
  readonly setPinCells: React.Dispatch<React.SetStateAction<string[]>>;
  readonly confirmCells: string[];
  readonly setConfirmCells: React.Dispatch<React.SetStateAction<string[]>>;
}

export function SetPinStep({
  onSubmit,
  isLoading,
  error,
  pinCells,
  setPinCells,
  confirmCells,
  setConfirmCells,
}: SetPinStepProps) {
  const pin = pinCells.join("");
  const confirmPin = confirmCells.join("");
  const canSubmit = pin.length === 4 && confirmPin.length === 4 && !isLoading;

  return (
    <motion.div key="set-pin-step" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 30, opacity: 0 }} transition={{ duration: 0.3, ease }}>
      <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9a9490", marginBottom: 16 }}>
        Set your 4-digit PIN
      </p>

      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", borderRadius: 8, padding: 12, marginBottom: 20, background: "rgba(212,88,0,0.08)", border: "1px solid rgba(212,88,0,0.25)" }}>
        <AlertTriangle size={16} color="#d45800" style={{ flexShrink: 0, marginTop: 2 }} />
        <span style={{ fontSize: "0.78rem", lineHeight: 1.45, color: "#9a9490" }}>{SHARED_DEVICE_WARNING}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
          <legend style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9a9490", marginBottom: 10 }}>
            New PIN
          </legend>
          <DigitCodeInput
            cells={pinCells}
            setCells={setPinCells}
            disabled={isLoading}
            resetKey={error ? `pin-${error}` : "pin"}
          />
        </fieldset>

        <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
          <legend style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9a9490", marginBottom: 10 }}>
            Confirm PIN
          </legend>
          <DigitCodeInput
            cells={confirmCells}
            setCells={setConfirmCells}
            disabled={isLoading}
            resetKey={error ? `confirm-${error}` : "confirm"}
          />
        </fieldset>
      </div>

      {error && (
        <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 12 }}>
          <AlertCircle size={14} color="#ef4444" />
          <span style={{ fontSize: "0.78rem", color: "#ef4444" }}>{error}</span>
        </div>
      )}

      <button
        type="button"
        disabled={!canSubmit}
        onClick={() => onSubmit(pin, confirmPin)}
        style={{ width: "100%", height: 54, background: "linear-gradient(135deg, #d45800 0%, #b84a00 100%)", color: "white", border: "none", borderRadius: 10, fontSize: "0.95rem", fontWeight: 700, marginTop: 20, cursor: canSubmit ? "pointer" : "not-allowed", opacity: canSubmit ? 1 : 0.5 }}
      >
        {isLoading ? "Saving…" : "Continue →"}
      </button>
    </motion.div>
  );
}

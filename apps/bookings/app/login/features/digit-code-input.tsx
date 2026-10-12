"use client";

import { useCallback, useEffect, useRef } from "react";

const PIN_LEN = 4;

interface DigitCodeInputProps {
  readonly cells: string[];
  readonly setCells: React.Dispatch<React.SetStateAction<string[]>>;
  readonly onComplete?: (code: string) => void;
  readonly disabled?: boolean;
  readonly masked?: boolean;
  readonly autoFocus?: boolean;
  readonly resetKey?: string;
}

export function DigitCodeInput({
  cells,
  setCells,
  onComplete,
  disabled = false,
  masked = false,
  autoFocus = true,
  resetKey,
}: DigitCodeInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const focusIndex = useCallback((i: number) => {
    const el = inputsRef.current[i];
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  useEffect(() => {
    if (autoFocus) focusIndex(0);
  }, [autoFocus, focusIndex, resetKey]);

  function setCellAt(index: number, char: string) {
    setCells((prev) => {
      const next = [...prev];
      next[index] = char;
      return next;
    });
  }

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    if (digit) {
      setCells((prev) => {
        const next = [...prev];
        next[index] = digit;
        const full = next.join("");
        if (full.length === PIN_LEN && onComplete) {
          queueMicrotask(() => onComplete(full));
        }
        return next;
      });
      if (index < PIN_LEN - 1) focusIndex(index + 1);
      return;
    }
    setCellAt(index, "");
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !cells[index] && index > 0) {
      e.preventDefault();
      focusIndex(index - 1);
      setCellAt(index - 1, "");
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusIndex(index - 1);
    }
    if (e.key === "ArrowRight" && index < PIN_LEN - 1) {
      e.preventDefault();
      focusIndex(index + 1);
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, PIN_LEN);
    if (!pasted) return;
    const next = Array.from({ length: PIN_LEN }, (_, i) => pasted[i] ?? "");
    setCells(next);
    focusIndex(Math.min(pasted.length, PIN_LEN - 1));
    if (pasted.length === PIN_LEN && onComplete) {
      queueMicrotask(() => onComplete(pasted));
    }
  }

  return (
    <div onPaste={handlePaste} style={{ display: "flex", justifyContent: "center", gap: 10 }}>
      {cells.map((val, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type={masked ? "password" : "text"}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={val}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          style={{
            width: 44,
            height: 54,
            borderRadius: 10,
            textAlign: "center",
            fontSize: "1.5rem",
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
            background: "#0f0e0d",
            border: `1.5px solid ${val ? "#d45800" : "#2a2825"}`,
            color: "#f5f0eb",
            outline: "none",
            opacity: disabled ? 0.5 : 1,
          }}
          aria-label={`Digit ${i + 1} of ${PIN_LEN}`}
        />
      ))}
    </div>
  );
}

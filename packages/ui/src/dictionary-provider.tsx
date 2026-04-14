"use client";

import { createContext, useContext, useCallback, type ReactNode } from "react";

type Labels = Record<string, string>;

const DictionaryContext = createContext<Labels>({});

interface DictionaryProviderProps {
  readonly labels: Labels;
  readonly children: ReactNode;
}

export function DictionaryProvider({ labels, children }: DictionaryProviderProps) {
  return (
    <DictionaryContext value={labels}>
      {children}
    </DictionaryContext>
  );
}

/**
 * Returns a stable lookup function that resolves dictionary keys.
 * Call this ONCE at the top of your component — the returned `t` function
 * is a plain function, safe to use anywhere in JSX or callbacks.
 */
export function useLabels(): (key: string) => string {
  const labels = useContext(DictionaryContext);
  return useCallback((key: string) => labels[key] ?? key, [labels]);
}

/**
 * @deprecated Use `useLabels()` instead. This function calls useContext
 * internally, which violates hook ordering rules when used conditionally.
 */
export function useText(key: string): string {
  const labels = useContext(DictionaryContext);
  return labels[key] ?? key;
}

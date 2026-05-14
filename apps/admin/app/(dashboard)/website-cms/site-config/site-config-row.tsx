"use client";

import { useState, useTransition } from "react";
import { updateSiteConfig } from "../actions";

export function SiteConfigRow({
  configKey,
  initialValue,
}: {
  readonly configKey: string;
  readonly initialValue: string;
}): React.ReactElement {
  const [value, setValue] = useState(initialValue);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function save(): void {
    setMsg(null);
    start(async () => {
      const res = await updateSiteConfig(configKey, value);
      setMsg(res.success ? "Saved" : res.error);
    });
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <label className="flex-1 space-y-1">
        <span className="text-xs font-medium uppercase text-muted-foreground">
          {configKey}
        </span>
        <input
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </label>
      <button
        type="button"
        disabled={pending}
        onClick={save}
        className="h-9 shrink-0 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        Save
      </button>
      {msg ? (
        <span className="text-xs text-muted-foreground sm:ml-2">{msg}</span>
      ) : null}
    </div>
  );
}

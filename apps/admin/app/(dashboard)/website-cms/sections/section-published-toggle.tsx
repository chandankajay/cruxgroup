"use client";

import { useState, useTransition } from "react";
import { toggleSectionPublished } from "../actions";

export function SectionPublishedToggle({
  id,
  initial,
}: {
  readonly id: string;
  readonly initial: boolean;
}): React.ReactElement {
  const [checked, setChecked] = useState(initial);
  const [pending, start] = useTransition();

  function flip(): void {
    const next = !checked;
    setChecked(next);
    start(async () => {
      const res = await toggleSectionPublished(id, next);
      if (!res.success) setChecked(!next);
    });
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        disabled={pending}
        onChange={flip}
      />
      Published
    </label>
  );
}

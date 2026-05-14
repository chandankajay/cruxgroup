"use client";

import { useState, useTransition } from "react";
import { toggleBlogPublished } from "../actions";

export function BlogPublishedToggle({
  id,
  initial,
}: {
  readonly id: string;
  readonly initial: boolean;
}): React.ReactElement {
  const [checked, setChecked] = useState(initial);
  const [pending, start] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const next = e.target.checked;
    setChecked(next);
    start(async () => {
      const res = await toggleBlogPublished(id, next);
      if (!res.success) setChecked(!next);
    });
  }

  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={pending}
      onChange={onChange}
      aria-label="Published"
    />
  );
}

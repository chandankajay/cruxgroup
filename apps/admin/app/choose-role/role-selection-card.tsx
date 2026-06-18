"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { selectAdminRoleAction } from "./actions";

export function RoleSelectionCard() {
  const { update } = useSession();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function choose(role: "PARTNER" | "SALES") {
    setError(undefined);
    startTransition(async () => {
      try {
        const result = await selectAdminRoleAction(role);
        if (!result.ok) {
          setError(result.error);
          return;
        }

        if ("alreadyChosen" in result) {
          window.location.assign(result.redirectTo);
          return;
        }

        await update({ role: result.role });
        window.location.assign(result.redirectTo);
      } catch {
        setError("Could not save your role. Please try again.");
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-lg rounded-2xl border border-border/60 bg-card p-6 shadow-lg sm:p-8">
      <h1 className="text-center text-2xl font-bold tracking-tight text-foreground">
        Welcome to Crux Admin
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Are you joining as a Fleet Owner (Partner) or as a Sales Person?
      </p>
      <p className="mt-1 text-center text-xs text-muted-foreground">
        This is a one-time choice for your account.
      </p>

      {error ? (
        <p className="mt-4 text-center text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => choose("PARTNER")}
          className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-6 text-left transition-colors hover:bg-amber-500/20 disabled:opacity-50"
        >
          <p className="text-lg font-bold text-foreground">Fleet Owner</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage fleet, jobs, walk-in bookings, and partner tools.
          </p>
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => choose("SALES")}
          className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-6 text-left transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
        >
          <p className="text-lg font-bold text-foreground">Sales Person</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Track leads, follow-ups, and conversions you bring to Crux.
          </p>
        </button>
      </div>
    </div>
  );
}

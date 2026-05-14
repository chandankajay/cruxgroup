"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { ProfileFormState } from "../actions";
import { updateProfileAction } from "../actions";

interface ProfileFormProps {
  readonly initialName: string;
  readonly initialEmail: string;
  readonly initialCompanyName: string;
}

export function ProfileForm({
  initialName,
  initialEmail,
  initialCompanyName,
}: ProfileFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [companyName, setCompanyName] = useState(initialCompanyName);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res: ProfileFormState = await updateProfileAction({
        name,
        email,
        companyName,
      });
      if (!res.ok) {
        toast.error(
          res.error === "NOT_SIGNED_IN"
            ? "Please sign in again."
            : "Could not save your profile.",
        );
        return;
      }
      toast.success("Profile saved.");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto flex max-w-lg flex-col gap-5 rounded-2xl border border-brand-navy/15 bg-white p-6 shadow-sm"
    >
      <div>
        <label htmlFor="profile-name" className="mb-1.5 block text-sm font-semibold text-brand-navy">
          Name
        </label>
        <input
          id="profile-name"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-brand-navy/20 px-3 py-2.5 text-brand-navy outline-none ring-brand-navy/20 focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="profile-email" className="mb-1.5 block text-sm font-semibold text-brand-navy">
          Email <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <input
          id="profile-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-brand-navy/20 px-3 py-2.5 text-brand-navy outline-none ring-brand-navy/20 focus:ring-2"
        />
      </div>
      <div>
        <label
          htmlFor="profile-company"
          className="mb-1.5 block text-sm font-semibold text-brand-navy"
        >
          Company name{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <input
          id="profile-company"
          name="companyName"
          type="text"
          autoComplete="organization"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Your company or site name"
          className="w-full rounded-lg border border-brand-navy/20 px-3 py-2.5 text-brand-navy outline-none ring-brand-navy/20 focus:ring-2"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-xl bg-brand-navy px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

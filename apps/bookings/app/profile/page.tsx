import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../lib/auth";
import { requirePinSetup } from "../../lib/require-pin-setup";
import { prisma } from "@repo/db";
import { ProfileForm } from "./features/profile-form";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  await requirePinSetup();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, companyName: true, phoneNumber: true },
  });

  if (!user) {
    redirect("/login");
  }

  const phone = user.phoneNumber ?? session.user.phoneNumber ?? "";

  return (
    <main className="mx-auto min-h-[60vh] max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm font-semibold text-brand-navy/70 underline-offset-2 hover:underline"
        >
          ← Back to bookings
        </Link>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">
          Your profile
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Signed in as{" "}
          <span className="font-medium text-brand-navy tabular-nums">{phone || "—"}</span>
        </p>
      </div>
      <ProfileForm
        initialName={user.name}
        initialEmail={user.email ?? ""}
        initialCompanyName={user.companyName}
      />
    </main>
  );
}

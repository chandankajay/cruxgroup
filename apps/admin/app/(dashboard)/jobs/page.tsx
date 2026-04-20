import { redirect } from "next/navigation";
import { auth } from "../../../lib/auth";
import { LiveJobBoard } from "./features/live-job-board";

export const dynamic = "force-dynamic";

export default async function LiveJobsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-7xl pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-charcoal">Live job board</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Field trips with machine, operator, customer, and site. Times shown in IST (Asia/Kolkata).
        </p>
      </div>
      <LiveJobBoard />
    </div>
  );
}

import { auth } from "../../lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-charcoal">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform configuration and administration options.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account info */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-charcoal">
            Logged-in Account
          </h2>
          <div className="space-y-3 text-sm">
            <Row label="Name" value={session?.user?.name ?? "—"} />
            <Row label="Email" value={session?.user?.email ?? "—"} />
            <Row
              label="Role"
              value={
                (session?.user as { role?: string } | undefined)?.role ??
                "ADMIN"
              }
              accent
            />
          </div>
        </div>

        {/* Partner role management hint */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-charcoal">
            Partner Role Management
          </h2>
          <p className="text-sm text-muted-foreground">
            To grant a partner access to the admin dashboard, update their{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">
              role
            </code>{" "}
            field to{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">
              PARTNER
            </code>{" "}
            and set their{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">
              email
            </code>{" "}
            in MongoDB. They can then sign in with Google using that email.
          </p>
          <div className="mt-4 rounded-md bg-slate-50 p-4 font-mono text-xs text-slate-700">
            {`db.users.updateOne(`}
            <br />
            {`  { phoneNumber: "+91XXXXXXXXXX" },`}
            <br />
            {`  { $set: { role: "PARTNER", email: "partner@example.com" } }`}
            <br />
            {`)`}
          </div>
        </div>

        {/* Environment checklist */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 font-semibold text-charcoal">
            Environment Checklist
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <EnvCheck
              label="AUTH_SECRET"
              set={!!process.env.AUTH_SECRET}
            />
            <EnvCheck
              label="GOOGLE_CLIENT_ID"
              set={!!process.env.GOOGLE_CLIENT_ID}
            />
            <EnvCheck
              label="GOOGLE_CLIENT_SECRET"
              set={!!process.env.GOOGLE_CLIENT_SECRET}
            />
            <EnvCheck
              label="DATABASE_URL"
              set={!!process.env.DATABASE_URL}
            />
            <EnvCheck
              label="NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"
              set={!!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
            />
            <EnvCheck
              label="ALLOWED_ADMIN_EMAILS"
              set={!!process.env.ALLOWED_ADMIN_EMAILS}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
      <span
        className={`font-medium ${
          accent ? "text-brand-orange" : "text-charcoal"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function EnvCheck({ label, set }: { label: string; set: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
        set
          ? "border-green-100 bg-green-50"
          : "border-red-100 bg-red-50"
      }`}
    >
      <span className={`text-lg ${set ? "text-green-600" : "text-red-500"}`}>
        {set ? "✓" : "✗"}
      </span>
      <code
        className={`text-xs font-mono ${
          set ? "text-green-800" : "text-red-800"
        }`}
      >
        {label}
      </code>
    </div>
  );
}

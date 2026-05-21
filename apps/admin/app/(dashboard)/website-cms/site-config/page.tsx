import { redirect } from "next/navigation";
import { prisma } from "@repo/db";
import { requireAdminResourceAuthz } from "../../../../lib/resource-authz";
import { SiteConfigRow } from "./site-config-row";

export const dynamic = "force-dynamic";

const GROUPS: { title: string; keys: string[] }[] = [
  {
    title: "Contact & location",
    keys: ["phone", "email", "address"],
  },
  {
    title: "Social",
    keys: ["instagram", "youtube"],
  },
  {
    title: "Hero",
    keys: [
      "heroTagline_en",
      "heroTagline_te",
      "heroSubtitle_en",
      "heroSubtitle_te",
    ],
  },
  {
    title: "Partner hook",
    keys: [
      "partnerHook_en",
      "partnerHook_te",
      "partnerSub_en",
      "partnerSub_te",
    ],
  },
  {
    title: "Fleet & customers headings",
    keys: [
      "fleetHeading_en",
      "fleetHeading_te",
      "fleetSub_en",
      "fleetSub_te",
      "customersHeading_en",
      "customersHeading_te",
      "customersSub_en",
      "customersSub_te",
      "faqHeading_en",
      "faqHeading_te",
    ],
  },
  {
    title: "CTA strip",
    keys: ["ctaSecondaryLabel_en", "ctaSecondaryLabel_te"],
  },
  {
    title: "Footer",
    keys: ["footerTagline_en", "footerTagline_te"],
  },
];

export default async function SiteConfigPage(): Promise<React.ReactElement> {
  const ctx = await requireAdminResourceAuthz();
  if (!ctx) redirect("/login");

  const rows = await prisma.siteConfig.findMany({ orderBy: { key: "asc" } });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return (
    <div className="mx-auto max-w-3xl space-y-10 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Site config</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Key–value pairs used by the public website (apps/web).
        </p>
      </div>

      {GROUPS.map((g) => (
        <section key={g.title} className="space-y-4">
          <h2 className="text-lg font-medium">{g.title}</h2>
          <div className="space-y-3 rounded-xl border bg-card p-4">
            {g.keys.map((key) => (
              <SiteConfigRow key={key} configKey={key} initialValue={map[key] ?? ""} />
            ))}
          </div>
        </section>
      ))}

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Other keys</h2>
        <div className="space-y-3 rounded-xl border bg-card p-4">
          {rows
            .filter((r) => !GROUPS.flatMap((g) => g.keys).includes(r.key))
            .map((r) => (
              <SiteConfigRow
                key={r.key}
                configKey={r.key}
                initialValue={r.value}
              />
            ))}
        </div>
      </section>
    </div>
  );
}

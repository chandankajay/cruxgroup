import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveServiceSlug, SERVICE_CATALOG_LABELS } from "@repo/lib";
import { SpokeProjectsStrip } from "../../../../../components/services/spoke-projects-strip";
import {
  getPublishedServiceAreaPageTagged,
  getPublishedSpokeProjects,
  listPublishedServiceAreaPageParams,
} from "../../../../../lib/services/cached-content";

export const revalidate = 86400;

type Props = {
  params: Promise<{ locale: string; slug: string; area: string }>;
};

export async function generateStaticParams(): Promise<
  { slug: string; area: string; locale: string }[]
> {
  if (!process.env.DATABASE_URL) return [];
  try {
    const pages = await listPublishedServiceAreaPageParams();
    return pages.map((p) => ({
      slug: p.serviceSlug,
      area: p.areaSlug,
      locale: "en",
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, area } = await params;
  const serviceSlug = resolveServiceSlug(slug);
  if (!serviceSlug) return { title: "Service" };

  const page = await getPublishedServiceAreaPageTagged(serviceSlug, area);

  const serviceName = SERVICE_CATALOG_LABELS[serviceSlug];
  const areaName = page?.area.displayName ?? area;
  const indexable = page?.published && !page.thinContent;

  return {
    title: `${serviceName} in ${areaName} — Crux Group`,
    description: `Book ${serviceName.toLowerCase()} near ${areaName}. Site visit, quotation and delivery from Crux Group, Kothur.`,
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export default async function ServiceAreaPage({ params }: Props) {
  const { slug, area, locale } = await params;
  const serviceSlug = resolveServiceSlug(slug);
  if (!serviceSlug) notFound();

  const page = await getPublishedServiceAreaPageTagged(serviceSlug, area);
  if (!page?.published) notFound();

  const projects = await getPublishedSpokeProjects(serviceSlug, area);
  const serviceName = SERVICE_CATALOG_LABELS[serviceSlug];

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-white">
      <h1 className="text-3xl font-bold">
        {serviceName} in {page.area.displayName}
      </h1>
      <p className="mt-4 text-zinc-400">
        {page.area.roadKmFromBase.toFixed(0)} km road from our Fatimapur (Kothur) base.
        {page.lastReviewed
          ? ` Last reviewed ${page.lastReviewed.toLocaleDateString("en-IN")}.`
          : ""}
      </p>
      <a
        href={`/${locale}/services/request-quote`}
        className="mt-8 inline-block rounded-xl bg-amber-500 px-6 py-3 font-semibold text-black"
      >
        Request a site visit
      </a>
      <SpokeProjectsStrip projects={projects} locale={locale} />
    </main>
  );
}

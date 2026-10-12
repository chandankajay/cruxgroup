import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SERVICE_CATALOG_LABELS } from "@repo/lib";
import { getPublishedProjectsList } from "../../../lib/services/cached-content";
import { parseLocale } from "../../../lib/locale";

export const metadata: Metadata = {
  title: "Service projects & case studies — Crux Group",
  description:
    "Recent land levelling, fencing, earthworks and farmhouse projects delivered near Kothur, Shadnagar, and the Hyderabad ORR south corridor.",
};

type Photo = { url: string; alt: string; order?: number };

function heroPhoto(photos: unknown): Photo | null {
  if (!Array.isArray(photos) || photos.length === 0) return null;
  const sorted = [...photos].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const p = sorted[0] as Photo;
  return p?.url ? p : null;
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = parseLocale(raw);
  const projects = await getPublishedProjectsList();

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">Projects & case studies</h1>
        <p className="mt-2 text-zinc-400">
          Site work delivered by Crux crews — updated from our admin CMS without redeploying the site.
        </p>
        <ul className="mt-10 grid gap-8 sm:grid-cols-2">
          {projects.map((p) => {
            const photo = heroPhoto(p.photos);
            const serviceLabel =
              SERVICE_CATALOG_LABELS[
                p.serviceSlug as keyof typeof SERVICE_CATALOG_LABELS
              ] ?? p.serviceSlug;
            return (
              <li key={p.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                {photo ? (
                  <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-xl">
                    <Image
                      src={photo.url}
                      alt={photo.alt}
                      fill
                      sizes="(min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <h2 className="text-lg font-semibold">{p.title}</h2>
                <p className="text-sm text-amber-400">{serviceLabel}</p>
                <p className="mt-1 text-sm text-zinc-400">
                  {[p.villageLabel, p.sizeLabel].filter(Boolean).join(" · ")}
                </p>
                {p.testimonial ? (
                  <p className="mt-3 text-sm italic text-zinc-300">&ldquo;{p.testimonial}&rdquo;</p>
                ) : null}
              </li>
            );
          })}
        </ul>
        <Link
          href={`/${locale}/services/request-quote`}
          className="mt-10 inline-block rounded-xl bg-amber-500 px-6 py-3 font-semibold text-black"
        >
          Request a site visit
        </Link>
      </div>
    </main>
  );
}

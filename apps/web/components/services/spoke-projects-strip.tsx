import Image from "next/image";
import Link from "next/link";

type ProjectCard = {
  id: string;
  title: string;
  villageLabel: string | null;
  sizeLabel: string | null;
  photos: unknown;
  testimonial: string | null;
};

type Photo = { url: string; alt: string; order?: number };

function firstPhoto(photos: unknown): Photo | null {
  if (!Array.isArray(photos) || photos.length === 0) return null;
  const sorted = [...photos].sort(
    (a, b) => ((a as Photo).order ?? 0) - ((b as Photo).order ?? 0),
  );
  const p = sorted[0] as Photo;
  return p?.url ? p : null;
}

export function SpokeProjectsStrip({
  projects,
  locale,
}: {
  readonly projects: ProjectCard[];
  readonly locale: string;
}) {
  if (projects.length === 0) return null;

  return (
    <section className="mt-12 border-t border-zinc-800 pt-10">
      <h2 className="text-xl font-semibold">Recent projects nearby</h2>
      <ul className="mt-6 grid gap-6 sm:grid-cols-2">
        {projects.map((p) => {
          const photo = firstPhoto(p.photos);
          return (
            <li key={p.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              {photo ? (
                <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-lg">
                  <Image
                    src={photo.url}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <p className="font-medium">{p.title}</p>
              <p className="text-sm text-zinc-400">
                {[p.villageLabel, p.sizeLabel].filter(Boolean).join(" · ")}
              </p>
              {p.testimonial ? (
                <p className="mt-2 text-sm italic text-zinc-300">&ldquo;{p.testimonial}&rdquo;</p>
              ) : null}
            </li>
          );
        })}
      </ul>
      <Link
        href={`/${locale}/projects`}
        className="mt-6 inline-block text-sm text-amber-400 hover:underline"
      >
        View all projects →
      </Link>
    </section>
  );
}

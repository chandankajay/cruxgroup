"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Switch } from "@repo/ui/switch";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import { SERVICE_CATALOG_SLUGS, SERVICE_CATALOG_LABELS } from "@repo/lib";
import {
  upsertProjectAction,
  uploadProjectPhotoAction,
  type ProjectDetail,
  type ProjectPhoto,
} from "../actions";

type Props = {
  readonly mode: "create" | "edit";
  readonly initial?: ProjectDetail;
};

export function ProjectForm({ mode, initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [serviceSlug, setServiceSlug] = useState(
    initial?.serviceSlug ?? "land-levelling",
  );
  const [areaSlug, setAreaSlug] = useState(initial?.areaSlug ?? "");
  const [villageLabel, setVillageLabel] = useState(initial?.villageLabel ?? "");
  const [sizeLabel, setSizeLabel] = useState(initial?.sizeLabel ?? "");
  const [testimonial, setTestimonial] = useState(initial?.testimonial ?? "");
  const [published, setPublished] = useState(initial?.published ?? false);
  const [photos, setPhotos] = useState<ProjectPhoto[]>(
    initial?.photos?.length
      ? initial.photos
      : [],
  );

  function movePhoto(index: number, dir: -1 | 1) {
    const next = photos.slice();
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    const current = next[index];
    const swap = next[target];
    if (!current || !swap) return;
    next[index] = swap;
    next[target] = current;
    setPhotos(next.map((p, i) => ({ ...p, order: i })));
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.set("file", file);
    const result = await uploadProjectPhotoAction(fd);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setPhotos((prev) => [
      ...prev,
      { url: result.url, alt: title || "Project photo", order: prev.length },
    ]);
    e.target.value = "";
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    startTransition(async () => {
      const result = await upsertProjectAction({
        id: initial?.id,
        title,
        serviceSlug,
        areaSlug,
        villageLabel,
        sizeLabel,
        testimonial,
        published,
        photos,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (mode === "create") {
        router.push(`/website-cms/projects/${result.id}/edit`);
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">
          {mode === "create" ? "New project" : "Edit project"}
        </h1>
        <Link href="/website-cms/projects" className="text-sm text-muted-foreground hover:underline">
          ← Back to projects
        </Link>
      </div>

      {error ? <p className="text-sm text-red-500" role="alert">{error}</p> : null}

      <div className="space-y-4 rounded-xl border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="p-title">Title *</Label>
          <Input id="p-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="p-service">Service *</Label>
            <select
              id="p-service"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={serviceSlug}
              onChange={(e) => setServiceSlug(e.target.value)}
            >
              {SERVICE_CATALOG_SLUGS.map((slug) => (
                <option key={slug} value={slug}>{SERVICE_CATALOG_LABELS[slug]}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-area">Area slug</Label>
            <Input
              id="p-area"
              value={areaSlug}
              onChange={(e) => setAreaSlug(e.target.value)}
              placeholder="shadnagar"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-village">Village label</Label>
            <Input id="p-village" value={villageLabel} onChange={(e) => setVillageLabel(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-size">Size</Label>
            <Input id="p-size" value={sizeLabel} onChange={(e) => setSizeLabel(e.target.value)} placeholder="2.5 acres" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-testimonial">Testimonial</Label>
          <Textarea id="p-testimonial" value={testimonial} onChange={(e) => setTestimonial(e.target.value)} rows={3} />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="font-medium">Published</p>
            <p className="text-sm text-muted-foreground">Shows on /projects and service spoke pages.</p>
          </div>
          <Switch checked={published} onCheckedChange={setPublished} aria-label="Published" />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border bg-card p-6">
        <h2 className="font-semibold">Photos *</h2>
        <p className="text-sm text-muted-foreground">JPG/PNG/WebP up to 5 MB. Add alt text for each image.</p>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPickFile} />
        <ul className="space-y-4">
          {photos.map((photo, index) => (
            <li key={photo.url} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of blob URL */}
              <img src={photo.url} alt="" className="h-20 w-28 rounded object-cover" />
              <Input
                aria-label={`Alt text for photo ${index + 1}`}
                value={photo.alt}
                onChange={(e) => {
                  const next = photos.slice();
                  next[index] = { ...photo, alt: e.target.value };
                  setPhotos(next);
                }}
                placeholder="Alt text"
                className="flex-1"
              />
              <div className="flex gap-2">
                <button type="button" className="text-sm underline" onClick={() => movePhoto(index, -1)}>Up</button>
                <button type="button" className="text-sm underline" onClick={() => movePhoto(index, 1)}>Down</button>
                <button
                  type="button"
                  className="text-sm text-red-600"
                  onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-amber-500 px-6 py-3 font-medium text-white hover:bg-amber-600 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save project"}
      </button>
    </form>
  );
}

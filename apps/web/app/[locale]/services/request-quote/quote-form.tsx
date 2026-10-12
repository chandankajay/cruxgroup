"use client";

import { useMemo, useState, useTransition } from "react";
import {
  SERVICE_CATALOG_LABELS,
  SERVICE_CATALOG_SLUGS,
  findVillageById,
  getClustersData,
} from "@repo/lib";
import {
  submitServiceQuoteRequest,
  uploadQuoteSitePhotoAction,
} from "../../../../lib/services/quote-request-action";

const TIMELINES = [
  "Within 1 week",
  "Within 2 weeks",
  "Within 1 month",
  "Flexible",
];

export function QuoteRequestForm() {
  const clusters = useMemo(() => getClustersData(), []);
  const [serviceSlug, setServiceSlug] = useState<string>("land-levelling");
  const [villageId, setVillageId] = useState("");
  const [landSize, setLandSize] = useState("");
  const [timeline, setTimeline] = useState(TIMELINES[1]);
  const [landType, setLandType] = useState("Agricultural, uneven");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const village = villageId ? findVillageById(villageId) : undefined;
  const distanceOk =
    village &&
    (village.roadDistanceFromHubKm <= 50 || village.distanceFromHubKm <= 50);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    setSuccess(undefined);
    startTransition(async () => {
      const result = await submitServiceQuoteRequest({
        serviceSlug,
        villageId,
        landSize,
        timeline,
        landType,
        name,
        phone,
        whatsappOptIn,
        photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const msg = result.beyondServiceArea
        ? `Request received. Your site is about ${result.distanceKm} km from our base — we will confirm if we can visit.`
        : `Request received. We will call you to schedule a free site visit.`;
      setSuccess(msg);
    });
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-8 text-white">
      <div>
        <h1 className="text-3xl font-bold">Get a free site visit &amp; quote</h1>
        <p className="mt-2 text-sm text-zinc-400">
          We serve within 50 km of our base at Fatimapur, Kothur. Our team visits the site, then
          sends a quotation.
        </p>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Which service do you need? *</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {SERVICE_CATALOG_SLUGS.map((slug) => (
            <label
              key={slug}
              className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                serviceSlug === slug
                  ? "border-amber-500 bg-amber-500/10"
                  : "border-zinc-700 bg-zinc-900/50"
              }`}
            >
              <input
                type="radio"
                name="service"
                className="sr-only"
                checked={serviceSlug === slug}
                onChange={() => setServiceSlug(slug)}
              />
              <span className="font-medium">{SERVICE_CATALOG_LABELS[slug]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="village">Area or village *</label>
          <select
            id="village"
            required
            value={villageId}
            onChange={(e) => setVillageId(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-3 text-white"
          >
            <option value="">Select…</option>
            {clusters.villages.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} — {v.mandal}
              </option>
            ))}
          </select>
          {village ? (
            <p
              className={`text-sm ${distanceOk ? "text-emerald-400" : "text-amber-400"}`}
            >
              {distanceOk ? "✓" : "⚠"}{" "}
              {village.name} is {village.roadDistanceFromHubKm.toFixed(0)} km road (
              {village.distanceFromHubKm.toFixed(0)} km straight) from our Kothur base
              {distanceOk ? " — within our service area" : " — outside 50 km, we may still contact you"}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="land-size">Land size *</label>
          <input
            id="land-size"
            required
            value={landSize}
            onChange={(e) => setLandSize(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-3"
            placeholder="2.5 acres"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="timeline">When do you want to start? *</label>
          <select
            id="timeline"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-3"
          >
            {TIMELINES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="land-type">Land type</label>
          <input
            id="land-type"
            value={landType}
            onChange={(e) => setLandType(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-3"
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Site photos (optional, up to 5)</p>
        <div className="rounded-xl border border-dashed border-zinc-700 p-4">
          {photoUrls.length > 0 ? (
            <ul className="mb-3 flex flex-wrap gap-2">
              {photoUrls.map((url) => (
                <li key={url} className="text-xs text-zinc-400 truncate max-w-[120px]">
                  {url.split("/").pop()}
                </li>
              ))}
            </ul>
          ) : null}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploadingPhoto || photoUrls.length >= 5}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploadingPhoto(true);
              setError(undefined);
              const fd = new FormData();
              fd.set("file", file);
              const result = await uploadQuoteSitePhotoAction(fd);
              setUploadingPhoto(false);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              setPhotoUrls((prev) => [...prev, result.url].slice(0, 5));
              e.target.value = "";
            }}
          />
          <p className="mt-1 text-xs text-zinc-500">JPG or PNG, max 10 MB each</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="name">Your name *</label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-3"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="phone">Phone *</label>
          <input
            id="phone"
            required
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-3"
            placeholder="+91 98480 12345"
          />
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={whatsappOptIn}
          onChange={(e) => setWhatsappOptIn(e.target.checked)}
          className="size-5 accent-amber-500"
        />
        Send me updates and the quotation on WhatsApp
      </label>

      {error ? <p className="text-sm text-red-400" role="alert">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-400" role="status">{success}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-amber-500 py-4 text-lg font-semibold text-black hover:bg-amber-400 disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Request site visit"}
      </button>
      <p className="text-center text-xs text-zinc-500">
        By submitting, you agree to be contacted by Crux Group about this request.
      </p>
    </form>
  );
}

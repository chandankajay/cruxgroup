"use server";

import { headers } from "next/headers";
import { prisma } from "@repo/db";
import { serviceQuoteRequestSchema } from "@repo/validators/service-quote";
import { consumeRateLimit } from "@repo/db/rate-limit";
import { logLeadActivity } from "@repo/db/lead-activity";
import { uploadPublicSiteImage } from "../blob-upload";
import { calculateDistanceKm } from "@repo/lib/geo";
import { findVillageById, getHomeBaseHub } from "@repo/lib/clusters";
import { resolveServiceSlug } from "@repo/lib/service-leads";
import { isPublicVercelBlobUrl } from "@repo/validators/service-quote";

export async function uploadQuoteSitePhotoAction(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("x-real-ip") ??
    "unknown";
  const rate = await consumeRateLimit(`service-quote-upload:${ip}`, 15, 15 * 60 * 1000);
  if (!rate.ok) {
    return { ok: false, error: "Too many uploads. Try again later." };
  }
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "No file provided." };
  }
  return uploadPublicSiteImage("service-quotes", file);
}

export type QuoteRequestResult =
  | { ok: true; leadId: string; beyondServiceArea: boolean; distanceKm: number }
  | { ok: false; error: string; retryAfterSec?: number };

export async function submitServiceQuoteRequest(
  raw: unknown,
): Promise<QuoteRequestResult> {
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("x-real-ip") ??
    "unknown";

  const rate = await consumeRateLimit(`service-quote:${ip}`, 5, 15 * 60 * 1000);
  if (!rate.ok) {
    return {
      ok: false,
      error: "Too many requests. Please try again later.",
      retryAfterSec: Math.ceil(rate.retryAfterMs / 1000),
    };
  }

  const parsed = serviceQuoteRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Please check the form and try again." };
  }

  if (parsed.data.photoUrls?.some((url) => !isPublicVercelBlobUrl(url))) {
    return { ok: false, error: "Invalid photo URL." };
  }

  const serviceSlug = resolveServiceSlug(parsed.data.serviceSlug);
  if (!serviceSlug) {
    return { ok: false, error: "Select a valid service." };
  }

  const village = findVillageById(parsed.data.villageId);
  if (!village) {
    return { ok: false, error: "Select a valid area or village." };
  }

  const hub = getHomeBaseHub();
  const straightLineKm = calculateDistanceKm(hub.hub.coordinates, village.coordinates);
  const roadKm = village.roadDistanceFromHubKm ?? straightLineKm;
  const beyondServiceArea = roadKm > 50 || straightLineKm > 50;

  const phoneDigits = parsed.data.phone.replace(/\D/g, "").slice(-10);
  if (phoneDigits.length !== 10) {
    return { ok: false, error: "Enter a valid 10-digit mobile number." };
  }

  const lead = await prisma.lead.create({
    data: {
      leadType: "SERVICE",
      serviceStage: "NEW",
      status: "NEW",
      salesPersonId: null,
      name: parsed.data.name.trim(),
      phoneNumber: phoneDigits,
      source: "Web form",
      serviceSlug,
      areaLabel: `${village.name}, ${village.mandal}`,
      villageId: village.id,
      landSize: parsed.data.landSize.trim(),
      timeline: parsed.data.timeline.trim(),
      landType: parsed.data.landType?.trim() ?? "",
      whatsappOptIn: parsed.data.whatsappOptIn,
      straightLineKmFromBase: straightLineKm,
      roadKmFromBase: roadKm,
      beyondServiceArea,
      sitePhotoUrls: parsed.data.photoUrls ?? [],
    },
    select: { id: true },
  });

  await logLeadActivity({
    leadId: lead.id,
    kind: "CREATED",
    message: "Lead created from website quote form",
    meta: { beyondServiceArea, roadKm },
  });

  return {
    ok: true,
    leadId: lead.id,
    beyondServiceArea,
    distanceKm: Math.round(roadKm * 10) / 10,
  };
}

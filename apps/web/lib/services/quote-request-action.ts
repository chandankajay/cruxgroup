"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@repo/db";
import { consumeRateLimit } from "@repo/db/rate-limit";
import { logLeadActivity } from "@repo/db/lead-activity";
import {
  calculateDistanceKm,
  findVillageById,
  getHomeBaseHub,
  resolveServiceSlug,
} from "@repo/lib";
const quoteRequestSchema = z
  .object({
    serviceSlug: z.string().min(1),
    villageId: z.string().min(1),
    landSize: z.string().min(1).max(80),
    timeline: z.string().min(1).max(80),
    landType: z.string().max(80).optional(),
    name: z.string().min(2).max(120),
    phone: z.string().min(10).max(15),
    whatsappOptIn: z.boolean(),
    photoUrls: z.array(z.string().url()).max(5).optional(),
  })
  .strict();

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

  const parsed = quoteRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Please check the form and try again." };
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

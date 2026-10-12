import "server-only";

import { after } from "next/server";
import { revalidateTag } from "next/cache";
import {
  projectsForSpokeTag,
  projectsListTag,
  serviceAreaPageTag,
  serviceAreaPagesListTag,
} from "@repo/lib/services-revalidate";
import { getAdminServerEnv } from "./server-env";

/** Next 16 requires a cacheLife profile as the second argument. */
const CACHE_PROFILE = "default";

async function revalidateWebProjectTags(tags: string[]): Promise<void> {
  let env;
  try {
    env = getAdminServerEnv();
  } catch (error) {
    console.error("[services-revalidate] admin env invalid", error);
    return;
  }

  const webUrl = env.CRUXGROUP_WEB_URL.replace(/\/$/, "");
  const secret = env.CRUX_SERVICES_REVALIDATE_SECRET;

  try {
    const res = await fetch(`${webUrl}/api/revalidate/services`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ tags }),
    });
    if (!res.ok) {
      console.error("[services-revalidate] web revalidate failed", res.status);
    }
  } catch (error) {
    console.error("[services-revalidate] web revalidate error", error);
  }
}

function scheduleWebRevalidate(tags: string[]): void {
  after(() => revalidateWebProjectTags(tags));
}

export function revalidateServiceAreaPage(serviceSlug: string, areaSlug: string): void {
  const tags = [serviceAreaPageTag(serviceSlug, areaSlug), serviceAreaPagesListTag()];
  for (const tag of tags) {
    revalidateTag(tag, CACHE_PROFILE);
  }
  scheduleWebRevalidate(tags);
}

export function revalidateProjects(serviceSlug?: string | null, areaSlug?: string | null): void {
  const tags = [projectsListTag()];
  if (serviceSlug && areaSlug) {
    tags.push(projectsForSpokeTag(serviceSlug, areaSlug));
  }
  for (const tag of tags) {
    revalidateTag(tag, CACHE_PROFILE);
  }
  scheduleWebRevalidate(tags);
}

import "server-only";

import { revalidateTag } from "next/cache";
import {
  projectsForSpokeTag,
  projectsListTag,
  serviceAreaPageTag,
  serviceAreaPagesListTag,
} from "@repo/lib";

/** Next 16 requires a cacheLife profile as the second argument. */
const CACHE_PROFILE = "default";

export function revalidateServiceAreaPage(serviceSlug: string, areaSlug: string): void {
  revalidateTag(serviceAreaPageTag(serviceSlug, areaSlug), CACHE_PROFILE);
  revalidateTag(serviceAreaPagesListTag(), CACHE_PROFILE);
}

export function revalidateProjects(serviceSlug?: string | null, areaSlug?: string | null): void {
  revalidateTag(projectsListTag(), CACHE_PROFILE);
  if (serviceSlug && areaSlug) {
    revalidateTag(projectsForSpokeTag(serviceSlug, areaSlug), CACHE_PROFILE);
  }
}

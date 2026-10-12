/** Next.js cache tags for services SEO and projects (CWA-28). */
export function serviceAreaPageTag(serviceSlug: string, areaSlug: string): string {
  return `service-area-page:${serviceSlug}:${areaSlug}`;
}

export function serviceAreaPagesListTag(): string {
  return "service-area-pages";
}

export function projectsListTag(): string {
  return "projects:all";
}

export function projectsForSpokeTag(serviceSlug: string, areaSlug: string): string {
  return `projects:${serviceSlug}:${areaSlug}`;
}

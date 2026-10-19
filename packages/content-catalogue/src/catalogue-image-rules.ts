import type { z } from "zod";

/** Real site photos only (brief §4 + project earthwork set). */
export const OWN_IMAGE_KEYS = new Set([
  "jcb",
  "excavator",
  "hydra-crane",
  "earth-works",
  "land-levelling",
  "fencing",
  "post-hole-digger",
  "precast-machine-made",
  "earthworks-jcb-trench",
  "earthworks-levelling-road",
  "earthworks-tipper-spoil",
]);

/** AI scene illustrations — never `own`. */
export const ILLUS_IMAGE_KEYS = new Set([
  "cover-hero",
  "dozer",
  "precast-handmade",
  "building-construction",
]);

const GENERATED_PREFIXES = ["farm-", "wall-", "fence-"] as const;

export function isGeneratedImageKey(key: string): boolean {
  if (ILLUS_IMAGE_KEYS.has(key)) {
    return true;
  }
  return GENERATED_PREFIXES.some((prefix) => key.startsWith(prefix));
}

export function validateCatalogueImageRef(
  ref: { key: string; kind: "own" | "design" | "illus" },
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
): void {
  if (ILLUS_IMAGE_KEYS.has(ref.key) && ref.kind !== "illus") {
    ctx.addIssue({
      code: "custom",
      message: `Image "${ref.key}" must be kind illus`,
      path: [...pathPrefix, "kind"],
    });
  }

  if (isGeneratedImageKey(ref.key) && ref.kind === "own") {
    ctx.addIssue({
      code: "custom",
      message: `Generated image "${ref.key}" cannot be kind own`,
      path: [...pathPrefix, "kind"],
    });
  }

  if (ref.kind === "own" && !OWN_IMAGE_KEYS.has(ref.key)) {
    ctx.addIssue({
      code: "custom",
      message: `Image key "${ref.key}" is not in the own-photo allow-list`,
      path: [...pathPrefix, "key"],
    });
  }
}

export function validateDesignOptionImage(
  ref: { key: string; kind: "own" | "design" | "illus" },
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[],
): void {
  validateCatalogueImageRef(ref, ctx, [...pathPrefix, "image"]);
  if (ref.kind !== "design") {
    ctx.addIssue({
      code: "custom",
      message: `Design option image "${ref.key}" must be kind design`,
      path: [...pathPrefix, "image", "kind"],
    });
  }
}

export const BOOKINGS_URL =
  process.env["NEXT_PUBLIC_BOOKINGS_URL"] ?? "https://bookings.cruxgroup.in";

export const ADMIN_URL =
  process.env["NEXT_PUBLIC_ADMIN_URL"] ?? "https://admin.cruxgroup.in";

export const PHONE = process.env["NEXT_PUBLIC_PHONE"] ?? "";

export const EMAIL =
  process.env["NEXT_PUBLIC_EMAIL"] ?? "connect@cruxgroup.in";

export const SITE_URL =
  process.env["NEXT_PUBLIC_SITE_URL"] ?? "https://www.cruxgroup.in";

export const WHATSAPP_ORDER_URL = "https://wa.aisensy.com/aabg08";

/** Fallback social URLs when CMS values are empty (SEO trust signals). */
export const INSTAGRAM_URL =
  process.env["NEXT_PUBLIC_INSTAGRAM_URL"] ??
  "https://www.instagram.com/cruxgroup";

export const YOUTUBE_URL =
  process.env["NEXT_PUBLIC_YOUTUBE_URL"] ??
  "https://www.youtube.com/@cruxgroup";

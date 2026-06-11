"use client";

import Image from "next/image";
import Link from "next/link";
import { PlayCircle, Share2 } from "lucide-react";
import type { SiteConfigMap } from "../../lib/content";
import { INSTAGRAM_URL, YOUTUBE_URL } from "../../lib/env";
import type { Locale } from "../../lib/locale";
import { BillingText } from "../ui/BillingText";

export function Footer({
  locale,
  data,
}: {
  readonly locale: Locale;
  readonly data: SiteConfigMap;
}): React.ReactElement {
  const phone = data["phone"] ?? "";
  const email = data["email"] ?? "";
  const address = data["address"] ?? "";
  const instagram = (data["instagram"] ?? "").trim() || INSTAGRAM_URL;
  const youtube = (data["youtube"] ?? "").trim() || YOUTUBE_URL;
  const tagEn = data["footerTagline_en"] ?? "";
  const tagTe = data["footerTagline_te"] ?? "";

  return (
    <footer id="contact" className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <Link href={`/${locale}`} className="inline-block">
            <Image
              src="/logo.png"
              alt="Crux Group"
              width={200}
              height={48}
              className="h-9 w-auto max-w-[200px] object-contain object-left"
            />
          </Link>
          <p className="mt-4 max-w-xs text-base text-muted">
            <BillingText en={tagEn} te={tagTe} />
          </p>
        </div>

        <div>
          <p className="text-base font-semibold text-offwhite">Quick links</p>
          <ul className="mt-4 space-y-2 text-base text-muted">
            <li>
              <Link
                href={`/${locale}#fleet`}
                className="inline-block min-h-11 py-2 hover:text-accent"
              >
                Fleet
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}#partners`}
                className="inline-block min-h-11 py-2 hover:text-accent"
              >
                Partners
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/blog`}
                className="inline-block min-h-11 py-2 hover:text-accent"
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/telangana`}
                className="inline-block min-h-11 py-2 hover:text-accent"
              >
                Service areas
              </Link>
            </li>
          </ul>
          <div className="mt-6 flex gap-3">
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border text-offwhite transition-colors hover:border-brand hover:text-accent"
              aria-label="Crux Group on Instagram"
            >
              <Share2 className="size-5" aria-hidden />
            </a>
            <a
              href={youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border text-offwhite transition-colors hover:border-brand hover:text-accent"
              aria-label="Crux Group on YouTube"
            >
              <PlayCircle className="size-5" aria-hidden />
            </a>
          </div>
        </div>

        <div>
          <p className="text-base font-semibold text-offwhite">Contact</p>
          <ul className="mt-4 space-y-2 text-base text-muted">
            {phone ? (
              <li>
                <a
                  href={`tel:+${phone.replace(/\D/g, "")}`}
                  className="inline-block min-h-11 py-2 hover:text-accent"
                >
                  +{phone.replace(/\D/g, "")}
                </a>
              </li>
            ) : null}
            {email ? (
              <li>
                <a
                  href={`mailto:${email}`}
                  className="inline-block min-h-11 py-2 hover:text-accent"
                >
                  {email}
                </a>
              </li>
            ) : null}
            {address ? (
              <li>
                <BillingText en={address} te={address} />
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-4 text-center text-sm text-muted">
        © {new Date().getFullYear()} Crux Group. Built with ♥ in Telangana.
      </div>
    </footer>
  );
}

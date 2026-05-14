"use client";

import Image from "next/image";
import Link from "next/link";
import { PlayCircle, Share2 } from "lucide-react";
import type { SiteConfigMap } from "../../lib/content";
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
  const instagram = data["instagram"] ?? "";
  const youtube = data["youtube"] ?? "";
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
          <p className="mt-4 max-w-xs text-sm text-muted">
            <BillingText en={tagEn} te={tagTe} />
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-offwhite">Quick links</p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>
              <Link
                href={`/${locale}#fleet`}
                className="hover:text-accent"
              >
                Fleet
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}#partners`}
                className="hover:text-accent"
              >
                Partners
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/blog`}
                className="hover:text-accent"
              >
                Blog
              </Link>
            </li>
          </ul>
          <div className="mt-6 flex gap-3">
            {instagram ? (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border p-2 text-offwhite hover:border-brand hover:text-accent"
                aria-label="Instagram"
              >
                <Share2 className="size-5" />
              </a>
            ) : null}
            {youtube ? (
              <a
                href={youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border p-2 text-offwhite hover:border-brand hover:text-accent"
                aria-label="YouTube"
              >
                <PlayCircle className="size-5" />
              </a>
            ) : null}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-offwhite">Contact</p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {phone ? (
              <li>
                <a
                  href={`tel:+${phone.replace(/\D/g, "")}`}
                  className="hover:text-accent"
                >
                  +{phone.replace(/\D/g, "")}
                </a>
              </li>
            ) : null}
            {email ? (
              <li>
                <a href={`mailto:${email}`} className="hover:text-accent">
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

      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} Crux Group. Built with ♥ in Telangana.
      </div>
    </footer>
  );
}

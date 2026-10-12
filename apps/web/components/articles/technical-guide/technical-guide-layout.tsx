"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { WHATSAPP_ORDER_URL } from "../../../lib/env";
import type { TechnicalGuideMeta } from "../../../lib/seo/data/technical-guides";

export interface SpecItem {
  readonly label: string;
  readonly value: string;
}

export interface GuideSection {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly specs?: readonly SpecItem[];
  readonly applications?: readonly string[];
  readonly notes?: readonly string[];
  readonly bullets?: readonly string[];
}

export interface TechnicalGuideLayoutProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly intro: string;
  readonly sections: readonly GuideSection[];
  readonly relatedGuides: readonly TechnicalGuideMeta[];
  readonly locale: string;
  readonly whatsappTopic: string;
  readonly jumpNavLabel?: string;
  readonly equipmentLinks?: readonly { readonly href: string; readonly label: string }[];
}

export const sectionVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

function buildWhatsAppHref(topic: string): string {
  const message = `Hi Crux, I am interested in getting a cost estimate for ${topic}.`;
  return `${WHATSAPP_ORDER_URL}?text=${encodeURIComponent(message)}`;
}

function GuideSectionBlock({
  section,
  index,
}: {
  readonly section: GuideSection;
  readonly index: number;
}) {
  return (
    <motion.section
      id={section.id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      variants={sectionVariants}
      className="scroll-mt-24 rounded-2xl border border-border bg-surface/40 p-6 sm:p-8"
    >
      <h2 className="text-xl font-bold text-offwhite sm:text-2xl">{section.title}</h2>
      <p className="mt-4 leading-relaxed text-muted">{section.summary}</p>

      {section.bullets && section.bullets.length > 0 ? (
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
          {section.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}

      {section.specs && section.specs.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand">
            Technical specifications
          </h3>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            {section.specs.map((spec) => (
              <div
                key={spec.label}
                className="rounded-lg border border-border/80 bg-dark/30 px-4 py-3"
              >
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                  {spec.label}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-offwhite/90">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      {section.applications && section.applications.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand">
            Recommended applications
          </h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
            {section.applications.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {section.notes && section.notes.length > 0 ? (
        <div className="mt-6 rounded-lg border border-brand/20 bg-brand/5 px-4 py-3">
          <h3 className="text-sm font-semibold text-offwhite">Engineering notes</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
            {section.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </motion.section>
  );
}

export function TechnicalGuideLayout({
  eyebrow,
  title,
  intro,
  sections,
  relatedGuides,
  locale,
  whatsappTopic,
  jumpNavLabel = "Jump to section",
  equipmentLinks,
}: TechnicalGuideLayoutProps): React.ReactElement {
  return (
    <div className="space-y-10">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-sm font-medium uppercase tracking-widest text-brand">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-offwhite md:text-4xl lg:text-[2.75rem]">
          {title}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted">{intro}</p>
      </motion.header>

      {sections.length > 1 ? (
        <nav
          aria-label="Guide sections"
          className="rounded-xl border border-border bg-surface/30 p-4 sm:p-5"
        >
          <p className="text-sm font-semibold text-offwhite">{jumpNavLabel}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="inline-block rounded-full border border-border px-3 py-1.5 text-xs font-medium text-brand transition-colors hover:border-brand/50 hover:bg-brand/10"
                >
                  {s.title.replace(/^(Solution [A-D]|Type \d):\s*/, "")}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <div className="space-y-8">
        {sections.map((section, index) => (
          <GuideSectionBlock key={section.id} section={section} index={index} />
        ))}
      </div>

      {relatedGuides.length > 0 ? (
        <section className="rounded-xl border border-border bg-surface/30 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-offwhite">Related engineering references</h2>
          <p className="mt-2 text-sm text-muted">
            Continue reading in our perimeter and foundation reference library.
          </p>
          <ul className="mt-4 space-y-3">
            {relatedGuides.map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={`/${locale}/articles/${guide.slug}`}
                  className="group block rounded-lg border border-border/80 bg-dark/20 px-4 py-3 transition-colors hover:border-brand/40"
                >
                  <span className="text-xs font-medium uppercase tracking-wide text-brand">
                    {guide.tag}
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-offwhite group-hover:text-brand">
                    {guide.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {equipmentLinks && equipmentLinks.length > 0 ? (
        <section className="rounded-xl border border-border bg-surface/30 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-offwhite">When to hire equipment</h2>
          <p className="mt-2 text-sm text-muted">
            Boundary work often runs alongside machine hire on the same site.
          </p>
          <ul className="mt-4 flex flex-wrap gap-3">
            {equipmentLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-full border border-border px-4 py-2 text-sm font-medium text-brand transition-colors hover:border-brand/50 hover:bg-brand/10"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        variants={sectionVariants}
        className="rounded-2xl border border-border bg-surface/40 px-6 py-10 text-center sm:px-10"
      >
        <h2 className="text-xl font-bold text-offwhite sm:text-2xl">
          Need a site-specific recommendation?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
          Share your plot size, soil conditions, and boundary length. Our civil team
          will suggest the appropriate system and foundation method — no obligation.
        </p>
        <div className="mt-8 flex justify-center">
          <motion.a
            href={buildWhatsAppHref(whatsappTopic)}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-8 py-4 text-base font-semibold text-white shadow-md transition-colors hover:bg-green-700 hover:shadow-[0_0_20px_rgba(22,163,74,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400"
          >
            <MessageCircle className="size-5 shrink-0" aria-hidden />
            Get a Site-Specific Quote
          </motion.a>
        </div>
        <p className="mt-4 text-xs text-muted">
          Crux Agri &amp; Rural Services LLP · Telangana &amp; Hyderabad service area
        </p>
      </motion.section>
    </div>
  );
}

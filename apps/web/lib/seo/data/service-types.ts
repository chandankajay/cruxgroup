import type { ServicePageSlug } from "../service-slugs";

export type ServiceFaq = {
  readonly question_en: string;
  readonly question_te: string;
  readonly answer_en: string;
  readonly answer_te: string;
};

export interface SiteService {
  readonly slug: ServicePageSlug;
  readonly image: string;
  readonly imageAlt: string;
  readonly unitLabel_en: string;
  readonly unitLabel_te: string;
  readonly eyebrow_en: string;
  readonly eyebrow_te: string;
  readonly title_en: string;
  readonly title_te: string;
  readonly body_en: string;
  readonly body_te: string;
  readonly process_en: readonly string[];
  readonly process_te: readonly string[];
  readonly specs_en: readonly string[];
  readonly specs_te: readonly string[];
  readonly faqs: readonly ServiceFaq[];
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly whatsappMessage: string;
  readonly relatedGuideSlugs: readonly string[];
  readonly searchTerms: readonly string[];
}

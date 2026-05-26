"use client";

import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { WHATSAPP_ORDER_URL } from "../../lib/env";
import { AnimateOnScroll } from "../ui/AnimateOnScroll";
import { BillingText } from "../ui/BillingText";
import { Button } from "../ui/Button";
import { SectionWrapper } from "../ui/SectionWrapper";

export function WhatsAppOrder({
  heading,
  sub,
}: {
  readonly heading: { readonly en: string; readonly te?: string | null };
  readonly sub: { readonly en: string; readonly te?: string | null };
}): React.ReactElement {
  return (
    <SectionWrapper id="whatsapp-order" dark>
      <div className="flex flex-col items-center gap-10 md:flex-row md:justify-between md:gap-16">
        {/* Text + CTA */}
        <AnimateOnScroll animation="fadeUp" className="flex-1 text-center md:text-left">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#25D366]/30 bg-[#25D366]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#25D366]">
            <MessageCircle className="size-4" />
            WhatsApp
          </div>

          <h2 className="text-3xl font-bold text-offwhite md:text-4xl">
            <BillingText en={heading.en} te={heading.te} />
          </h2>

          <p className="mt-4 max-w-lg text-muted">
            <BillingText en={sub.en} te={sub.te} />
          </p>

          <div className="mt-8">
            <Button
              href={WHATSAPP_ORDER_URL}
              external
              variant="primary"
              size="lg"
              iconLeft={MessageCircle}
              className="bg-[#25D366] hover:shadow-[0_0_24px_rgba(37,211,102,0.35)]"
            >
              <BillingText
                en="Order on WhatsApp"
                te="WhatsApp లో ఆర్డర్ చేయండి"
              />
            </Button>
          </div>
        </AnimateOnScroll>

        {/* QR Code */}
        <AnimateOnScroll animation="scaleIn" delay={100} className="shrink-0">
          <div className="rounded-2xl border border-border bg-white p-4 shadow-lg shadow-brand/5">
            <Image
              src="/images/whatsapp-qr.png"
              alt="Scan QR code to order on WhatsApp"
              width={220}
              height={220}
              className="rounded-lg"
            />
          </div>
          <p className="mt-3 text-center text-xs text-muted">
            <BillingText
              en="Scan to open WhatsApp"
              te="WhatsApp తెరవడానికి స్కాన్ చేయండి"
            />
          </p>
        </AnimateOnScroll>
      </div>
    </SectionWrapper>
  );
}

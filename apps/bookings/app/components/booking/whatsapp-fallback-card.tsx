"use client";

import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { WHATSAPP_ORDER_URL } from "../../../lib/env";
import { useLocationStore } from "../../stores/location-store";

function buildWhatsAppHref(location: string): string {
  const area = location.trim() || "my area";
  const message = `Hi Crux Group, I am looking for heavy equipment in ${area}. Can you help me source it?`;
  return `${WHATSAPP_ORDER_URL}?text=${encodeURIComponent(message)}`;
}

export function WhatsAppFallbackCard() {
  const formattedAddress = useLocationStore((s) => s.formattedAddress);
  const whatsAppHref = buildWhatsAppHref(formattedAddress);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{
        margin: "20px 24px 32px",
        padding: "clamp(24px, 5vw, 36px)",
        borderRadius: 20,
        border: "1.5px solid #5AA8E0",
        background: "linear-gradient(145deg, #f0f7fc 0%, #ffffff 55%)",
        textAlign: "center",
        maxWidth: 520,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 56,
          height: 56,
          borderRadius: "50%",
          backgroundColor: "rgba(45, 137, 200, 0.12)",
          marginBottom: 16,
        }}
      >
        <MessageCircle size={28} color="#2D89C8" strokeWidth={1.75} />
      </div>

      <h2
        style={{
          fontSize: "clamp(1.15rem, 3.5vw, 1.35rem)",
          fontWeight: 800,
          color: "#1E6A9E",
          marginBottom: 10,
          lineHeight: 1.3,
        }}
      >
        Didn&apos;t find your machine?
      </h2>

      <p
        style={{
          fontSize: "clamp(0.88rem, 2.5vw, 0.95rem)",
          color: "#475569",
          lineHeight: 1.55,
          marginBottom: 24,
          maxWidth: 400,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        Don&apos;t worry, we&apos;ve got your back! Drop us a message, and our offline
        sourcing team will arrange the exact fleet you need in your area shortly.
      </p>

      <a
        href={whatsAppHref}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: "14px 28px",
          borderRadius: 12,
          background: "linear-gradient(135deg, #d45800 0%, #b84a00 100%)",
          color: "#ffffff",
          fontSize: "0.95rem",
          fontWeight: 700,
          textDecoration: "none",
          boxShadow: "0 4px 14px rgba(212, 88, 0, 0.35)",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
          width: "100%",
          maxWidth: 280,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 6px 18px rgba(212, 88, 0, 0.42)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 14px rgba(212, 88, 0, 0.35)";
        }}
      >
        <MessageCircle size={20} strokeWidth={2} />
        Book via WhatsApp
      </a>
    </motion.div>
  );
}

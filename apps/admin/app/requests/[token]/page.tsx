import { prisma } from "@repo/db";
import { notFound } from "next/navigation";
import BookingResponseClient from "./BookingResponseClient";

export const dynamic = "force-dynamic";

function TokenExpiredPage() {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa", padding: 24 }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏰</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Link Expired</h1>
        <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.6, marginBottom: 24 }}>
          This booking response link has expired. Please contact Crux Group if you need assistance.
        </p>
        <a
          href="https://admin.cruxgroup.in/login"
          style={{ fontSize: 14, color: "#d45800", textDecoration: "underline", fontWeight: 600 }}
        >
          Go to Partner Portal →
        </a>
      </div>
    </div>
  );
}

function AlreadyRespondedPage({ response }: { response: string | null }) {
  const isAccepted = response === "ACCEPTED";
  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa", padding: 24 }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{isAccepted ? "✅" : "❌"}</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
          Already Responded
        </h1>
        <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.6, marginBottom: 24 }}>
          {isAccepted
            ? "You have already accepted this booking. Our team will be in touch."
            : "You have already declined this booking."}
        </p>
        <a
          href="https://admin.cruxgroup.in/login"
          style={{ fontSize: 14, color: "#d45800", textDecoration: "underline", fontWeight: 600 }}
        >
          Go to Partner Portal →
        </a>
      </div>
    </div>
  );
}

export default async function BookingResponsePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const responseToken = await prisma.bookingResponseToken.findUnique({
    where: { token },
    include: {
      booking: {
        include: {
          user: { select: { name: true, phoneNumber: true } },
          equipment: { select: { name: true, category: true, images: true } },
        },
      },
      partner: {
        include: {
          user: { select: { name: true } },
        },
      },
    },
  });

  if (!responseToken) return notFound();

  if (responseToken.expiresAt < new Date()) {
    return <TokenExpiredPage />;
  }

  if (responseToken.usedAt) {
    return <AlreadyRespondedPage response={responseToken.response} />;
  }

  const { booking } = responseToken;
  const durationLabel =
    booking.pricing.unit === "daily"
      ? `${booking.pricing.duration} day${booking.pricing.duration > 1 ? "s" : ""}`
      : `${booking.pricing.duration} hours`;

  const startDateLabel = booking.startDate
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(booking.startDate)
    : "TBD";

  return (
    <BookingResponseClient
      token={token}
      expiresAt={responseToken.expiresAt.toISOString()}
      partnerName={responseToken.partner.user.name || "Partner"}
      equipmentName={booking.equipment.name}
      equipmentCategory={booking.equipment.category}
      equipmentImage={booking.equipment.images[0] ?? null}
      customerName={booking.user.name || booking.user.phoneNumber || "Customer"}
      locationAddress={booking.location.address}
      startDate={startDateLabel}
      duration={durationLabel}
    />
  );
}

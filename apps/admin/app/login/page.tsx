import { signIn } from "../../lib/auth";
import { GoogleSignInButton } from "./google-sign-in-button";
import { PhoneOtpForm } from "./phone-otp-form";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const isAccessDenied = params.error === "AccessDenied";
  const isConfiguration = params.error === "Configuration";

  async function googleLoginAction() {
    "use server";
    await signIn("google", { redirectTo: "/" });
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          backgroundColor: "#fff",
          borderRadius: 20,
          padding: "36px 32px",
          boxShadow: "0 32px 72px rgba(0,0,0,0.3)",
        }}
      >
        {/* Logo / brand */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1e3a8a 0%, #D97706 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              fontSize: "1.5rem",
            }}
          >
            🏗️
          </div>
          <h1
            style={{ fontSize: "1.375rem", fontWeight: 700, color: "#0f172a", margin: 0 }}
          >
            Crux Group Admin
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#64748b", marginTop: 6 }}>
            Admin & Partner access portal
          </p>
        </div>

        {/* Error banners */}
        {(isAccessDenied || isConfiguration) && (
          <div
            style={{
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 20,
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            <span style={{ fontSize: "1rem", flexShrink: 0 }}>⚠️</span>
            <div>
              <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#B91C1C", margin: 0 }}>
                {isAccessDenied ? "Access Denied" : "Sign-in Error"}
              </p>
              <p style={{ fontSize: "0.75rem", color: "#DC2626", marginTop: 2 }}>
                {isAccessDenied
                  ? "Your account is not authorised. Contact the system administrator."
                  : "Something went wrong. Please try again."}
              </p>
            </div>
          </div>
        )}

        {/* ── Google sign-in (Admin) ───────────────────────────────── */}
        <div style={{ marginBottom: 4 }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10, textAlign: "center" }}>
            Admin Login
          </p>
          <GoogleSignInButton action={googleLoginAction} />
        </div>

        {/* ── Divider ─────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            margin: "20px 0",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
          <span style={{ fontSize: "0.75rem", color: "#94A3B8", fontWeight: 500 }}>
            or Partner login
          </span>
          <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
        </div>

        {/* ── Phone OTP sign-in (Partner) ──────────────────────────── */}
        <PhoneOtpForm />

        <p
          style={{
            textAlign: "center",
            fontSize: "0.7rem",
            color: "#94a3b8",
            marginTop: 20,
          }}
        >
          Admin access requires a @cruxgroup.in Google account.
          <br />
          Partners sign in with their registered phone number.
        </p>
      </div>
    </main>
  );
}

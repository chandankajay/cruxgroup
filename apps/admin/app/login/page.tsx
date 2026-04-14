import { signIn } from "../../lib/auth";
import { GoogleSignInButton } from "./google-sign-in-button";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const isAccessDenied = params.error === "AccessDenied";

  async function loginAction() {
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
        background: "linear-gradient(135deg, #1e293b 0%, #1e3a8a 100%)",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          backgroundColor: "#fff",
          borderRadius: 20,
          padding: "40px 36px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
        }}
      >
        {/* Logo area */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1e3a8a 0%, #F97316 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: "1.5rem",
            }}
          >
            🏗️
          </div>
          <h1
            style={{
              fontSize: "1.375rem",
              fontWeight: 700,
              color: "#1e293b",
              margin: 0,
            }}
          >
            Crux Group Admin
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#64748b",
              marginTop: 6,
            }}
          >
            Sign in with your authorised Google account
          </p>
        </div>

        {/* Access denied error */}
        {isAccessDenied && (
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
              <p
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "#B91C1C",
                  margin: 0,
                }}
              >
                Access Denied
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#DC2626",
                  marginTop: 2,
                }}
              >
                Your account is not authorised to access this dashboard. Contact
                the system administrator.
              </p>
            </div>
          </div>
        )}

        <GoogleSignInButton action={loginAction} />

        <p
          style={{
            textAlign: "center",
            fontSize: "0.75rem",
            color: "#94a3b8",
            marginTop: 20,
          }}
        >
          Only authorised Crux Group accounts can access this dashboard.
        </p>
      </div>
    </main>
  );
}

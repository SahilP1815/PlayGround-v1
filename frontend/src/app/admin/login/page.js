"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --teal: #1abc9c; --teal-light: #e8f8f4; --teal-mid: #a8e6d8; --teal-dark: #0e9b7d;
    --white: #ffffff;
    --text-primary: #1a2b2a; --text-secondary: #5f7b78; --text-muted: #9ab5b2;
    --border: #e2eeec; --card-shadow: 0 2px 12px rgba(26,188,156,0.07);
    --radius: 16px; --radius-sm: 10px; --radius-xs: 8px;
    --font: 'Plus Jakarta Sans', sans-serif;
    --red: #e74c3c; --red-light: #fdeaea;
  }
  .pg-body { font-family: var(--font); background: #f0f5f4; color: var(--text-primary); min-height: 100vh; }
  .pg-card { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--card-shadow); overflow: hidden; padding: 40px; }
  .pg-logo-icon { width: 36px; height: 36px; background: var(--teal); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
  .pg-btn { padding: 12px; border: 1.5px solid var(--border); border-radius: var(--radius-xs); font-size: 14px; font-weight: 600; color: white; background: var(--teal); cursor: pointer; transition: all 0.15s; font-family: var(--font); width: 100%; border-color: var(--teal); }
  .pg-btn:hover { background: var(--teal-dark); }
  .pg-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .pg-input { padding: 8px 12px; border: 1.5px solid var(--border); border-radius: var(--radius-xs); font-size: 14px; font-family: var(--font); outline: none; transition: border-color 0.15s; }
  .pg-input:focus { border-color: var(--teal); }
`;

export default function AdminLoginPage() {
  const router = useRouter();
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsAuthenticating(true);
    try {
      const formData = new URLSearchParams();
      formData.append("username", loginForm.email);
      formData.append("password", loginForm.password);
      formData.append("role", "admin");

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        const token = data.access_token;

        // Fetch User details to verify role
        const meRes = await fetch("/api/auth/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (meRes.ok) {
          const user = await meRes.json();
          if (user.role?.toLowerCase() !== "admin") {
            setLoginError("Unauthorized. This portal is for Administrators only.");
            return;
          }
          localStorage.setItem("token", token);
          localStorage.setItem("userName", user.name);
          localStorage.setItem("userRole", "admin");
          router.push("/admin");
        } else {
          setLoginError("Failed to retrieve admin profile.");
        }
      } else {
        const errorMsg = typeof data.detail === "string"
          ? data.detail
          : Array.isArray(data.detail)
            ? data.detail[0]?.msg
            : "Invalid admin credentials";
        setLoginError(errorMsg);
      }
    } catch (err) {
      setLoginError("Connection failed. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="pg-body" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{css}</style>
      <div className="pg-card" style={{ maxWidth: 400, width: "100%", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="pg-logo-icon" style={{ margin: "0 auto 16px" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="20" height="20">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>Admin Portal</h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6 }}>Secure access for platform administrators</p>
        </div>

        <form onSubmit={handleAdminLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {loginError && (
            <div style={{
              padding: "10px 14px", background: "var(--red-light)", color: "var(--red)",
              fontSize: 12, borderRadius: 8, fontWeight: 600, border: "1px solid #f9d6d6"
            }}>
              {loginError}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Admin Email</label>
            <input
              type="email"
              className="pg-input"
              placeholder="admin@playground.com"
              required
              value={loginForm.email}
              onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Password</label>
            <input
              type="password"
              className="pg-input"
              placeholder="••••••••"
              required
              value={loginForm.password}
              onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="pg-btn"
            style={{ marginTop: 8 }}
            disabled={isAuthenticating}
          >
            {isAuthenticating ? "Verifying..." : "Sign In to Console"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 24 }}>
          Protected by end-to-end encryption. Unauthorized access is strictly prohibited.
        </p>
      </div>
    </div>
  );
}

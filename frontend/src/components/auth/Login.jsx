import { useState } from "react";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";

export default function Login({ onLogin, loading }) {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setError("");
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await onLogin(form);
        } catch (err) {
            setError(err?.response?.data?.message || "Login failed");
            throw err;
        }
    };

    return (
        <>
            <div className="auth-welcome">
                <h2>Welcome back</h2>
                <p>Sign in to continue tracking your learning momentum.</p>
            </div>

            {error && <div className="auth-alert auth-alert-error">{error}</div>}

            <form className="auth-form" onSubmit={submit}>
                <div className="field">
                    <label>Email Address</label>
                    <div style={{ position: "relative" }}>
                        <FiMail
                            style={{
                                position: "absolute",
                                left: 14,
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "var(--color-text-subtle)",
                            }}
                        />
                        <input
                            className="input"
                            style={{ paddingLeft: 40 }}
                            type="email"
                            name="email"
                            placeholder="name@company.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                        />
                    </div>
                </div>

                <div className="field">
                    <div className="auth-password-row">
                        <label>Password</label>
                        <a href="#" onClick={(e) => e.preventDefault()}>Forgot?</a>
                    </div>
                    <div style={{ position: "relative" }}>
                        <FiLock
                            style={{
                                position: "absolute",
                                left: 14,
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "var(--color-text-subtle)",
                            }}
                        />
                        <input
                            className="input"
                            style={{ paddingLeft: 40, paddingRight: 44 }}
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            required
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            style={{
                                position: "absolute",
                                right: 10,
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "var(--color-text-subtle)",
                                fontSize: 12,
                                fontWeight: 600,
                                padding: "4px 6px",
                                borderRadius: 6,
                            }}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary auth-submit"
                    disabled={loading}
                >
                    {loading ? "Signing in…" : "Access Dashboard"}
                    {!loading && <FiArrowRight style={{ marginLeft: 4 }} />}
                </button>
            </form>

            <div className="auth-divider">Or continue with</div>

            <div className="auth-socials">
                <button
                    type="button"
                    className="auth-social"
                    onClick={() => alert("Google SSO is not configured yet.")}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M21.35 11.1H12v2.9h5.35c-.23 1.4-1.68 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.95 0-3.28 2.63-5.95 5.85-5.95 1.83 0 3.06.78 3.77 1.45l2.57-2.47C16.68 3.9 14.55 3 12 3 6.98 3 3 6.98 3 12s3.98 9 9 9c5.19 0 8.62-3.65 8.62-8.8 0-.6-.06-1.05-.27-1.1z" fill="#FFC107"/>
                        <path d="M3.16 7.3 6.3 9.6C7.1 7.6 9.33 6 12 6c1.83 0 3.06.78 3.77 1.45l2.57-2.47C16.68 3.9 14.55 3 12 3 8.3 3 5.13 5.17 3.74 8.12l-.58-.82z" fill="#FF3D00"/>
                        <path d="M12 21c2.46 0 4.55-.84 6.07-2.29l-2.8-2.37c-.76.52-1.74.86-3.27.86-2.51 0-4.64-1.69-5.4-3.97l-2.87 2.25C5.11 19.36 8.2 21 12 21z" fill="#4CAF50"/>
                        <path d="M21.35 11.1H12v2.9h5.35c.16.98.05 1.88-.33 2.63l2.8 2.37c1.87-1.73 2.95-4.28 2.95-7.5 0-.6-.06-1.05-.27-1.1z" fill="#1976D2"/>
                    </svg>
                    Google
                </button>
                <button
                    type="button"
                    className="auth-social"
                    onClick={() => alert("Work SSO is not configured yet.")}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 4v6"/></svg>
                    Work SSO
                </button>
            </div>
        </>
    );
}

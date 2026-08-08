import { useRef, useState } from "react";
import { FiUser, FiMail, FiLock, FiUpload } from "react-icons/fi";

export default function Signup({ onSignup, loading }) {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const fileRef = useRef(null);

    const initials = (form.name || "ML")
        .split(" ")
        .filter(Boolean)
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const handleChange = (e) => {
        setError("");
        setSuccess("");
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFile = (e) => {
        setError("");
        const file = e.target.files?.[0];
        if (!file) return;
        if (!/^image\/(jpe?g|png)$/i.test(file.type)) {
            setError("Only JPG and PNG images are allowed.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("Profile picture must be under 5 MB.");
            return;
        }
        setProfilePicture(file);
        setPreview(URL.createObjectURL(file));
    };

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (form.password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        if (profilePicture) fd.append("profilePicture", profilePicture);

        try {
            await onSignup(fd);
            setSuccess("Account created! Please sign in.");
        } catch (err) {
            setError(err?.response?.data?.message || "Sign up failed");
            throw err;
        }
    };

    return (
        <>
            <div className="auth-welcome">
                <h2>Create your account</h2>
                <p>Start tracking your learning journey in under a minute.</p>
            </div>

            {error && <div className="auth-alert auth-alert-error">{error}</div>}
            {success && <div className="auth-alert auth-alert-success">{success}</div>}

            <form className="auth-form" onSubmit={submit}>
                <div className="field">
                    <label>Full Name</label>
                    <div style={{ position: "relative" }}>
                        <FiUser
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
                            name="name"
                            placeholder="Alex Morgan"
                            value={form.name}
                            onChange={handleChange}
                            required
                            autoComplete="name"
                        />
                    </div>
                </div>

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
                            placeholder="alex@company.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                        />
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="field">
                        <label>Password</label>
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
                                style={{ paddingLeft: 40 }}
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
                                required
                                autoComplete="new-password"
                            />
                        </div>
                    </div>
                    <div className="field">
                        <label>Confirm</label>
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
                                style={{ paddingLeft: 40 }}
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••••"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                required
                                autoComplete="new-password"
                            />
                        </div>
                    </div>
                </div>

                <div className="field">
                    <label>Profile Picture <span style={{ color: "var(--color-text-subtle)", textTransform: "none", fontWeight: 500 }}>(optional)</span></label>
                    <div
                        className="avatar-upload"
                        onClick={() => fileRef.current?.click()}
                    >
                        <div className="avatar-upload-img">
                            {preview ? (
                                <img src={preview} alt="avatar preview" />
                            ) : (
                                initials
                            )}
                        </div>
                        <div className="avatar-upload-text">
                            <strong>
                                {preview ? "Change profile picture" : "Upload profile picture"}
                            </strong>
                            <span>
                                <FiUpload style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                                JPG or PNG · up to 5MB
                            </span>
                        </div>
                    </div>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={handleFile}
                        hidden
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary auth-submit"
                    disabled={loading}
                >
                    {loading ? "Creating account…" : "Create Account"}
                </button>
            </form>
        </>
    );
}

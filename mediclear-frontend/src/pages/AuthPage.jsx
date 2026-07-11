import { useState } from "react";
import "./AuthPage.css";

const API_URL = "http://localhost:5000";

export default function AuthPage({ onAuthSuccess }) {
    const [mode, setMode] = useState("login"); // "login" | "signup"
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
        const body =
            mode === "login"
                ? { email, password }
                : { email, password, name };

        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Something went wrong. Please try again.");
                setLoading(false);
                return;
            }

            if (mode === "login") {
                localStorage.setItem("mediclear_token", data.session.access_token);
                onAuthSuccess(data.user);
            } else {
                setError("");
                setMode("login");
                setPassword("");
            }
        } catch (err) {
            setError("Could not reach the server. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-visual">
                <div className="breathing-rings" aria-hidden="true">
                    <span className="ring ring-1" />
                    <span className="ring ring-2" />
                    <span className="ring ring-3" />
                </div>
                <div className="auth-visual-text">
                    <h1 className="brand-mark">MediClear</h1>
                    <p className="brand-tagline">
                        Your lab report, explained calmly — in plain language,
                        with a clear sense of what matters and what can wait.
                    </p>
                </div>
            </div>

            <div className="auth-form-panel">
                <div className="auth-card">
                    <div className="auth-tabs">
                        <button
                            className={mode === "login" ? "tab active" : "tab"}
                            onClick={() => { setMode("login"); setError(""); }}
                            type="button"
                        >
                            Log In
                        </button>
                        <button
                            className={mode === "signup" ? "tab active" : "tab"}
                            onClick={() => { setMode("signup"); setError(""); }}
                            type="button"
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {mode === "signup" && (
                            <>
                                <label className="field-label" htmlFor="name">Full Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    required
                                />
                            </>
                        )}

                        <label className="field-label" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />

                        <label className="field-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            minLength={6}
                            required
                        />

                        {error && <p className="auth-error">{error}</p>}

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
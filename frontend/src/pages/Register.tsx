import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import { ApiError } from "../services/api";

const COUNTRIES = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "IE", name: "Ireland" },
  { code: "NZ", name: "New Zealand" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "XX", name: "Other / prefer not to say" },
];

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [country, setCountry] = useState("IN");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!accepted) {
      setError("Please acknowledge the disclaimer to continue.");
      return;
    }
    setLoading(true);
    try {
      await register({ name, email, password, country, accepted_disclaimer: accepted });
      navigate("/app", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-cream)] px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-7">
          <Logo />
          <p className="mt-3 font-display text-lg text-[var(--color-navy)]/80">Take a breath. You're not alone.</p>
        </div>

        <div className="rounded-2xl bg-white p-6 sm:p-7" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex rounded-xl bg-[var(--color-cream-dim)] p-1 mb-6 text-sm font-medium">
            <Link to="/login" className="flex-1 text-center py-2 rounded-lg text-[var(--color-navy)]/55">
              Login
            </Link>
            <span className="flex-1 text-center py-2 rounded-lg bg-white text-[var(--color-navy)]" style={{ boxShadow: "var(--shadow-soft)" }}>
              Create Account
            </span>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-[var(--color-navy)]/80">Full name</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border border-[var(--color-navy)]/15 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-teal)]"
                placeholder="Your name"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-[var(--color-navy)]/80">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-[var(--color-navy)]/15 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-teal)]"
                placeholder="you@example.com"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-[var(--color-navy)]/80">Password</span>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl border border-[var(--color-navy)]/15 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-teal)]"
                  placeholder="min. 8 characters"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-[var(--color-navy)]/80">Confirm</span>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="rounded-xl border border-[var(--color-navy)]/15 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-teal)]"
                  placeholder="repeat password"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-[var(--color-navy)]/80">Country</span>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="rounded-xl border border-[var(--color-navy)]/15 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-teal)] bg-white"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              <span className="text-xs text-[var(--color-navy)]/45">Used only to show the right local emergency number.</span>
            </label>

            <label className="flex items-start gap-2.5 text-xs text-[var(--color-navy)]/70 mt-1">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 rounded"
                required
              />
              I understand that SereneAI provides emotional support and grounding assistance and is not a substitute for professional medical care.
            </label>

            {error && <p className="text-sm text-[var(--color-emergency)]">{error}</p>}

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

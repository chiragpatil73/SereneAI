import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import { ApiError } from "../services/api";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
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
            <span className="flex-1 text-center py-2 rounded-lg bg-white text-[var(--color-navy)]" style={{ boxShadow: "var(--shadow-soft)" }}>
              Login
            </span>
            <Link to="/register" className="flex-1 text-center py-2 rounded-lg text-[var(--color-navy)]/55">
              Create Account
            </Link>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-[var(--color-navy)]/80">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-navy)]/15 px-3.5 py-2.5 pr-10 text-sm outline-none focus:border-[var(--color-teal)]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-navy)]/45 focus-ring rounded"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-[var(--color-navy)]/60">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-[var(--color-teal-deep)] font-medium">
                Forgot password?
              </Link>
            </div>

            {error && <p className="text-sm text-[var(--color-emergency)]">{error}</p>}

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--color-navy)]/45">
          SereneAI provides emotional support and grounding assistance, not medical treatment.
        </p>
      </div>
    </div>
  );
}

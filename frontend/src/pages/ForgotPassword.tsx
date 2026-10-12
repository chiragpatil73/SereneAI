import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";

export function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-cream)] px-5 py-10">
      <div className="w-full max-w-sm text-center">
        <Logo className="justify-center" />
        <div className="mt-7 rounded-2xl bg-white p-6" style={{ boxShadow: "var(--shadow-soft)" }}>
          <h1 className="font-display text-lg text-[var(--color-navy)]">Reset your password</h1>
          <p className="mt-2 text-sm text-[var(--color-navy)]/65 leading-relaxed">
            Password reset by email isn't available in this prototype build yet. If you've forgotten your
            password, you can create a new account, or ask whoever runs your SereneAI deployment to help.
          </p>
          <Link to="/login" className="mt-5 inline-block text-sm font-medium text-[var(--color-teal-deep)]">
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

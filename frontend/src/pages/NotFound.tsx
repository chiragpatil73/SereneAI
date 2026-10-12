import { Link } from "react-router-dom";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-5 text-center">
      <Logo />
      <h1 className="font-display text-2xl text-[var(--color-navy)]">Page not found</h1>
      <p className="text-[var(--color-navy)]/60 max-w-sm">The page you're looking for doesn't exist, or may have moved.</p>
      <Link to="/">
        <Button>Back to SereneAI</Button>
      </Link>
    </div>
  );
}

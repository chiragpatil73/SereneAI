import { cn } from "../utils/cn";

export function Disclaimer({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <p className={cn("text-xs leading-relaxed text-[var(--color-navy)]/55", className)}>
      {compact
        ? "SereneAI offers grounding and support, not medical or mental-health treatment."
        : "SereneAI is an AI-assisted grounding and support prototype. It does not diagnose, treat, or replace a doctor, therapist, or emergency service."}
    </p>
  );
}

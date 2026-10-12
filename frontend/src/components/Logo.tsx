import { cn } from "../utils/cn";

export function Logo({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-display select-none", className)}>
      <svg width="26" height="26" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="18" fill="none" stroke={tone === "dark" ? "#4B7A76" : "#DFEBE4"} strokeWidth="2.5" />
        <circle cx="20" cy="20" r="7" fill={tone === "dark" ? "#C7A468" : "#DFEBE4"} opacity="0.9" />
      </svg>
      <span className={cn("text-lg tracking-tight font-medium", tone === "dark" ? "text-[var(--color-navy)]" : "text-[var(--color-cream)]")}>
        SereneAI
      </span>
    </span>
  );
}

import { cn } from "../utils/cn";

const LEVEL_STYLE: Record<string, string> = {
  Low: "bg-[var(--color-mint)] text-[var(--color-sage-deep)]",
  Moderate: "bg-[#F3E9D2] text-[#8A6A2A]",
  High: "bg-[var(--color-emergency-soft)] text-[var(--color-emergency)]",
};

export function StressIndicator({ level, className }: { level: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", LEVEL_STYLE[level] || "bg-black/5", className)}>
      {level}
    </span>
  );
}

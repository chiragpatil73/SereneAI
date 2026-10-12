import { cn } from "../utils/cn";

export function LoadingState({ label = "Loading...", className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-[var(--color-navy)]/60 py-8 justify-center", className)} role="status">
      <span className="h-2 w-2 rounded-full bg-[var(--color-teal)] animate-pulse" />
      <span className="h-2 w-2 rounded-full bg-[var(--color-teal)] animate-pulse [animation-delay:150ms]" />
      <span className="h-2 w-2 rounded-full bg-[var(--color-teal)] animate-pulse [animation-delay:300ms]" />
      <span className="ml-2">{label}</span>
    </div>
  );
}

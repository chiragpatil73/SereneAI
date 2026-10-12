export function formatDateTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric" }) + " · " +
    d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function formatTime(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function formatDuration(seconds: number): string {
  if (!seconds) return "0 min";
  const minutes = Math.round(seconds / 60);
  if (minutes < 1) return `${seconds}s`;
  return `${minutes} min`;
}

export function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const FEEDBACK_LABEL: Record<string, string> = {
  helped: "Helped",
  somewhat_helped: "Somewhat helped",
  didnt_help: "Didn't help",
  stopped: "Stopped early",
};

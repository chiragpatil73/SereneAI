import type { ReactNode } from "react";
import { Card } from "./Card";
import { StressIndicator } from "./StressIndicator";

export function MoodCard({ label, value, sublabel, icon }: { label: string; value: string; sublabel?: string; icon?: ReactNode }) {
  const isLevel = value === "Low" || value === "Moderate" || value === "High";
  return (
    <Card className="flex flex-col gap-2 py-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-[var(--color-navy)]/50">
        {icon}
        {label}
      </div>
      {isLevel ? (
        <StressIndicator level={value} className="self-start text-sm px-3 py-1.5" />
      ) : (
        <p className="font-display text-2xl text-[var(--color-navy)]">{value}</p>
      )}
      {sublabel && <p className="text-xs text-[var(--color-navy)]/45">{sublabel}</p>}
    </Card>
  );
}

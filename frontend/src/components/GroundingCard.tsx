import { Activity, Eye, Hand, Sun, Wind } from "lucide-react";
import { Card } from "./Card";
import { Button } from "./Button";
import type { Intervention } from "../types";

const ICONS: Record<string, typeof Wind> = { wind: Wind, eye: Eye, hand: Hand, sun: Sun, activity: Activity };

export function GroundingCard({ intervention, onStart }: { intervention: Intervention; onStart: () => void }) {
  const Icon = ICONS[intervention.icon] || Wind;
  return (
    <Card className="flex flex-col h-full">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-mint)] text-[var(--color-teal-deep)] mb-3">
        <Icon size={20} />
      </span>
      <h3 className="font-display text-base text-[var(--color-navy)]">{intervention.title}</h3>
      <p className="text-sm text-[var(--color-navy)]/65 mt-1 flex-1">{intervention.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {intervention.categories.map((c) => (
            <span key={c} className="text-[11px] rounded-full bg-black/5 px-2 py-0.5 text-[var(--color-navy)]/55">
              {c}
            </span>
          ))}
        </div>
        <span className="text-xs text-[var(--color-navy)]/45 shrink-0 ml-2">{intervention.duration_minutes} min</span>
      </div>
      <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={onStart}>
        Start Now →
      </Button>
    </Card>
  );
}

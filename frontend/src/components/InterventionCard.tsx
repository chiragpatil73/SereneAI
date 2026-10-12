import { Activity, Eye, Hand, MessageCircle, Sun, Wind } from "lucide-react";
import { Card } from "./Card";
import { Button } from "./Button";
import type { Intervention } from "../types";

const ICONS: Record<string, typeof Wind> = { wind: Wind, eye: Eye, hand: Hand, sun: Sun, activity: Activity, "message-circle": MessageCircle };

export function InterventionCard({ intervention, onStart, compact = false }: { intervention: Intervention; onStart: () => void; compact?: boolean }) {
  const Icon = ICONS[intervention.icon] || Wind;
  return (
    <Card className={compact ? "py-4" : undefined}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-mint)] text-[var(--color-teal-deep)]">
          <Icon size={19} />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base text-[var(--color-navy)]">{intervention.title}</h3>
          <p className="text-sm text-[var(--color-navy)]/65 mt-0.5">{intervention.description}</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-[var(--color-navy)]/45">{intervention.duration_minutes} min</span>
            <Button size="sm" variant="secondary" onClick={onStart}>
              Start Now →
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

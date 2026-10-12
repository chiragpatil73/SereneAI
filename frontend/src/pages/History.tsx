import { useEffect, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { api } from "../services/api";
import type { Analytics as AnalyticsData, HistoryItem } from "../types";
import { Card } from "../components/Card";
import { MoodChart } from "../components/MoodChart";
import { LoadingState } from "../components/LoadingState";
import { Disclaimer } from "../components/Disclaimer";
import { formatDateTime, formatDuration, FEEDBACK_LABEL } from "../utils/format";

const MOOD_LABELS: Record<number, string> = { 1: "Stressed", 2: "Low", 3: "Okay", 4: "Good", 5: "Great" };
const LEVEL_LABELS: Record<number, string> = { 1: "Low", 2: "Moderate", 3: "High" };

export function History() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.analytics(7), api.history()])
      .then(([a, h]) => {
        setAnalytics(a);
        setItems(h.items);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState className="mt-16" />;

  return (
    <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 sm:py-8 max-w-3xl w-full mx-auto">
      <h1 className="font-display text-2xl text-[var(--color-navy)]">History &amp; Insights</h1>
      <p className="mt-1 text-[var(--color-navy)]/60">Your reported mood, AI-estimated trends, and past sessions.</p>

      {analytics && (
        <>
          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base text-[var(--color-navy)]">Weekly Check-ins</h2>
                <span className="text-2xl font-display text-[var(--color-teal-deep)]">{analytics.weekly_checkins}</span>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base text-[var(--color-navy)]">Grounding Sessions</h2>
                <span className="text-2xl font-display text-[var(--color-teal-deep)]">{analytics.grounding_completed}</span>
              </div>
            </Card>
          </div>

          <Card className="mt-4">
            <h2 className="font-display text-base text-[var(--color-navy)] mb-2">Mood Journey</h2>
            <p className="text-xs text-[var(--color-navy)]/45 mb-1">Your reported mood</p>
            <MoodChart data={analytics.days} dataKey="mood_score" domain={[1, 5]} formatY={(v) => MOOD_LABELS[Math.round(v)] || ""} color="var(--color-sage-deep)" />
          </Card>

          <Card className="mt-4">
            <h2 className="font-display text-base text-[var(--color-navy)] mb-2">Stress Trend</h2>
            <p className="text-xs text-[var(--color-navy)]/45 mb-1">AI-estimated, not a medical measurement</p>
            <MoodChart data={analytics.days} dataKey="ai_stress" domain={[1, 3]} formatY={(v) => LEVEL_LABELS[Math.round(v)] || ""} color="var(--color-teal)" />
          </Card>
        </>
      )}

      <h2 className="mt-9 mb-3 font-display text-lg text-[var(--color-navy)]">Session History</h2>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-navy)]/45">No grounding sessions yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <Card key={item.id} className="py-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-[var(--color-navy)]/45">{formatDateTime(item.timestamp)}</p>
                  <p className="mt-1 text-sm font-medium text-[var(--color-navy)]">{item.title}</p>
                  <p className="text-xs text-[var(--color-navy)]/55 mt-0.5">
                    {item.mood && <span className="capitalize">Mood: {item.mood} · </span>}
                    {item.stress_level && <span>Stress: {item.stress_level} · </span>}
                    {formatDuration(item.duration_seconds)}
                    {item.feedback && <span> · {FEEDBACK_LABEL[item.feedback]}</span>}
                  </p>
                </div>
                {item.completed ? (
                  <CheckCircle2 size={18} className="text-[var(--color-sage-deep)] shrink-0 mt-0.5" />
                ) : (
                  <Circle size={18} className="text-[var(--color-navy)]/25 shrink-0 mt-0.5" />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Disclaimer className="mt-8" />
    </div>
  );
}

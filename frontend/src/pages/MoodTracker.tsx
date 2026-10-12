import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { api } from "../services/api";
import type { MoodEntry, Mood } from "../types";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { LoadingState } from "../components/LoadingState";
import { formatDateTime } from "../utils/format";
import { cn } from "../utils/cn";

const MOODS: { value: Mood; label: string; emoji: string }[] = [
  { value: "great", label: "Great", emoji: "😄" },
  { value: "good", label: "Good", emoji: "🙂" },
  { value: "okay", label: "Okay", emoji: "😐" },
  { value: "low", label: "Low", emoji: "😔" },
  { value: "stressed", label: "Stressed", emoji: "😣" },
];

const LEVELS = ["low", "moderate", "high"] as const;

export function MoodTracker() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mood, setMood] = useState<Mood | null>(null);
  const [stress, setStress] = useState<(typeof LEVELS)[number] | null>(null);
  const [anxiety, setAnxiety] = useState<(typeof LEVELS)[number] | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  function refresh() {
    api
      .listMood()
      .then(setEntries)
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function save() {
    if (!mood) return;
    setSaving(true);
    try {
      await api.addMood({ mood, stress_level: stress ?? undefined, anxiety_level: anxiety ?? undefined, note: note || undefined });
      setMood(null);
      setStress(null);
      setAnxiety(null);
      setNote("");
      refresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    try {
      await api.deleteMood(id);
    } catch {
      refresh();
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 sm:py-8 max-w-2xl w-full mx-auto">
      <h1 className="font-display text-2xl text-[var(--color-navy)]">Mood Tracker</h1>
      <p className="mt-1 text-[var(--color-navy)]/60">A quick, honest check-in — this is user-reported, just for you.</p>

      <Card className="mt-6">
        <p className="text-sm font-medium text-[var(--color-navy)]/75 mb-2.5">How are you feeling?</p>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-4 py-3 text-xs font-medium border transition-colors focus-ring",
                mood === m.value ? "border-[var(--color-teal)] bg-[var(--color-mint)]" : "border-[var(--color-navy)]/10"
              )}
            >
              <span className="text-xl">{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5">
          <div>
            <p className="text-xs font-medium text-[var(--color-navy)]/60 mb-1.5">Stress level (optional)</p>
            <div className="flex gap-1.5">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setStress((s) => (s === l ? null : l))}
                  className={cn(
                    "flex-1 rounded-lg py-1.5 text-xs capitalize border focus-ring",
                    stress === l ? "border-[var(--color-teal)] bg-[var(--color-mint)]" : "border-[var(--color-navy)]/10"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--color-navy)]/60 mb-1.5">Anxiety level (optional)</p>
            <div className="flex gap-1.5">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setAnxiety((s) => (s === l ? null : l))}
                  className={cn(
                    "flex-1 rounded-lg py-1.5 text-xs capitalize border focus-ring",
                    anxiety === l ? "border-[var(--color-teal)] bg-[var(--color-mint)]" : "border-[var(--color-navy)]/10"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note (optional)"
          rows={2}
          maxLength={1000}
          className="mt-4 w-full resize-none rounded-xl border border-[var(--color-navy)]/12 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-teal)]"
        />
        <Button className="mt-4" fullWidth disabled={!mood || saving} onClick={save}>
          {saving ? "Saving..." : "Save Check-In"}
        </Button>
      </Card>

      <h2 className="mt-9 mb-3 font-display text-lg text-[var(--color-navy)]">Recent Entries</h2>
      {loading ? (
        <LoadingState />
      ) : entries.length === 0 ? (
        <p className="text-sm text-[var(--color-navy)]/45">No entries yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((e) => (
            <Card key={e.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-[var(--color-navy)] capitalize">
                  {e.mood}
                  {e.stress_level && <span className="text-[var(--color-navy)]/45 font-normal"> · stress {e.stress_level}</span>}
                </p>
                {e.note && <p className="text-xs text-[var(--color-navy)]/55 mt-0.5">{e.note}</p>}
                <p className="text-xs text-[var(--color-navy)]/40 mt-0.5">{formatDateTime(e.timestamp)}</p>
              </div>
              <button
                onClick={() => remove(e.id)}
                aria-label="Delete entry"
                className="text-[var(--color-navy)]/35 hover:text-[var(--color-emergency)] focus-ring rounded p-1.5"
              >
                <Trash2 size={15} />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

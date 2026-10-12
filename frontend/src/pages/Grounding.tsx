import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type { Intervention } from "../types";
import { GroundingCard } from "../components/GroundingCard";
import { LoadingState } from "../components/LoadingState";
import { cn } from "../utils/cn";

const CATEGORIES = ["All", "Anxiety", "Overwhelm", "Stress", "Low Mood", "Focus"];

export function Grounding() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("All");

  useEffect(() => {
    api
      .groundingLibrary()
      .then((res) => setExercises(res.exercises))
      .finally(() => setLoading(false));
  }, []);

  const filtered = active === "All" ? exercises : exercises.filter((e) => e.categories.includes(active));

  return (
    <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 sm:py-8 max-w-4xl w-full mx-auto">
      <h1 className="font-display text-2xl text-[var(--color-navy)]">Grounding Library</h1>
      <p className="mt-1 text-[var(--color-navy)]/60">Short exercises to help you settle, one moment at a time.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium focus-ring transition-colors",
              active === c ? "bg-[var(--color-navy)] text-[var(--color-cream)]" : "bg-white text-[var(--color-navy)]/65 border border-[var(--color-navy)]/10"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState className="mt-10" />
      ) : (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ex) => (
            <GroundingCard key={ex.id} intervention={ex} onStart={() => navigate(`/app/exercise/${ex.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

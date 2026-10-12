import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, Gauge, Mic, Send, ShieldCheck, Smile } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { api, ApiError } from "../services/api";
import type { DashboardState, EmergencyPayload } from "../types";
import { MoodCard } from "../components/MoodCard";
import { InterventionCard } from "../components/InterventionCard";
import { LoadingState } from "../components/LoadingState";
import { Disclaimer } from "../components/Disclaimer";
import { EmergencyPanel } from "../components/EmergencyPanel";
import { useVoiceInput } from "../hooks/useSpeech";
import { cn } from "../utils/cn";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<DashboardState | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emergency, setEmergency] = useState<EmergencyPayload | null>(null);
  const [todayLabel] = useState(() =>
    new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
  );
  const { supported, listening, interim, start, stop } = useVoiceInput((text) =>
    setMessage((prev) => (prev ? prev + " " + text : text))
  );

  useEffect(() => {
    api.dashboard().then(setState).catch(() => undefined).finally(() => setLoading(false));
  }, []);

  async function submit() {
    const text = message.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    try {
      const result = await api.analyze({ message: text });
      if (result.type === "emergency") {
        setEmergency(result.emergency);
      } else {
        navigate("/app/chat", { state: { sessionId: result.session_id } });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSending(false);
      setMessage("");
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 sm:py-8 max-w-3xl w-full mx-auto">
      {emergency && <EmergencyPanel payload={emergency} onClose={() => setEmergency(null)} />}

      <div className="rounded-2xl bg-[var(--color-navy)] text-[var(--color-cream)] px-5 sm:px-7 py-6 sm:py-7">
        <p className="text-sm text-[var(--color-mint)] font-medium">{todayLabel}</p>
        <h1 className="font-display text-2xl sm:text-3xl mt-1.5">
          {greeting()}, {user?.name?.split(" ")[0]}
        </h1>
        <p className="mt-1.5 text-[var(--color-cream)]/70">How are you feeling today?</p>
      </div>

      <div className="mt-5 rounded-2xl bg-white p-4 sm:p-5" style={{ boxShadow: "var(--shadow-soft)" }}>
        <textarea
          value={listening && interim ? `${message} ${interim}`.trim() : message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={3}
          placeholder="Type your message..."
          className="w-full resize-none bg-transparent text-base outline-none placeholder:text-[var(--color-navy)]/35"
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-[var(--color-navy)]/40">{supported ? "Or speak instead" : "Voice input isn't supported here"}</p>
          <div className="flex items-center gap-2">
            {supported && (
              <button
                type="button"
                onClick={listening ? stop : start}
                aria-label="Speak instead"
                className={cn(
                  "rounded-full p-2.5 focus-ring",
                  listening ? "bg-[var(--color-emergency-soft)] text-[var(--color-emergency)]" : "bg-[var(--color-cream-dim)] text-[var(--color-navy)]/60"
                )}
              >
                <Mic size={17} />
              </button>
            )}
            <button
              type="button"
              onClick={submit}
              disabled={sending || !message.trim()}
              aria-label="Send"
              className="rounded-full p-2.5 bg-[var(--color-navy)] text-[var(--color-cream)] disabled:opacity-40 focus-ring"
            >
              <Send size={17} />
            </button>
          </div>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-[var(--color-emergency)]">{error}</p>}

      {loading ? (
        <LoadingState className="mt-10" />
      ) : (
        <>
          <h2 className="mt-9 mb-3 font-display text-lg text-[var(--color-navy)]">Your Current State</h2>
          <div className="grid grid-cols-3 gap-3">
            <MoodCard
              icon={<Activity size={14} />}
              label="Stress"
              value={state?.ai_estimated?.stress_level ?? "No assessment yet"}
              sublabel="AI-estimated"
            />
            <MoodCard
              icon={<Gauge size={14} />}
              label="Anxiety"
              value={state?.ai_estimated?.anxiety_level ?? "No assessment yet"}
              sublabel="AI-estimated"
            />
            <MoodCard
              icon={<Smile size={14} />}
              label="Mood"
              value={state?.user_reported?.mood ?? state?.ai_estimated?.mood_label ?? "No assessment yet"}
              sublabel={state?.user_reported ? "User-reported" : state?.ai_estimated ? "AI-estimated" : undefined}
            />
          </div>

          {state?.suggestion && (
            <>
              <h2 className="mt-9 mb-3 font-display text-lg text-[var(--color-navy)]">Suggested for you</h2>
              <InterventionCard
                intervention={state.suggestion}
                onStart={() => navigate(`/app/exercise/${state.suggestion!.id}`)}
              />
            </>
          )}
        </>
      )}

      <div className="mt-10 flex flex-col items-center gap-2">
        <Disclaimer className="text-center" />
        <Link
          to="/responsible-ai"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-navy)]/45 hover:text-[var(--color-teal-deep)] focus-ring rounded"
        >
          <ShieldCheck size={12} />
          How SereneAI handles your data and AI output
        </Link>
      </div>
    </div>
  );
}

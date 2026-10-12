import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Pause, Play, Square } from "lucide-react";
import { api } from "../services/api";
import { Button } from "../components/Button";
import { Disclaimer } from "../components/Disclaimer";
import { BreathingCircle, type BreathPhase } from "../components/BreathingCircle";
import { EXERCISE_STEPS } from "../utils/exerciseSteps";
import type { Feedback, AdaptationOutcome } from "../types";

const TITLES: Record<string, string> = {
  paced_breathing: "Paced Breathing",
  five_four_three_two_one: "5-4-3-2-1 Grounding",
  sensory_grounding: "Sensory Grounding",
  positive_reflection: "Positive Reflection",
  gentle_movement: "Gentle Movement",
  guided_check_in: "Guided Check-In",
};

const BREATH_ROUNDS = 5;
const BREATH_PHASES: { phase: BreathPhase; seconds: number }[] = [
  { phase: "inhale", seconds: 4 },
  { phase: "hold", seconds: 4 },
  { phase: "exhale", seconds: 6 },
];

const FEEDBACK_OPTIONS: { value: Feedback; label: string }[] = [
  { value: "helped", label: "Helped" },
  { value: "somewhat_helped", label: "Somewhat helped" },
  { value: "didnt_help", label: "Didn't help" },
];

export function ExercisePlayer() {
  const { type = "" } = useParams();
  const location = useLocation() as { state?: { sessionId?: number | null } };
  const navigate = useNavigate();
  const isBreathing = type === "paced_breathing";
  const steps = EXERCISE_STEPS[type] ?? [];

  const [interventionId, setInterventionId] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(steps[0]?.seconds ?? BREATH_PHASES[0].seconds);
  const [round, setRound] = useState(1);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [adaptation, setAdaptation] = useState<AdaptationOutcome | null>(null);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    api
      .startIntervention({ type, session_id: location.state?.sessionId ?? null })
      .then((res) => setInterventionId(res.id))
      .catch(() => undefined);
    
  }, [type]);

  useEffect(() => {
    if (paused || finished || stopped) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;
        
        if (isBreathing) {
          setPhaseIndex((p) => {
            const next = (p + 1) % BREATH_PHASES.length;
            if (next === 0) {
              setRound((r) => {
                if (r >= BREATH_ROUNDS) {
                  setFinished(true);
                  return r;
                }
                return r + 1;
              });
            }
            return next;
          });
          return BREATH_PHASES[(phaseIndex + 1) % BREATH_PHASES.length].seconds;
        } else {
          setStepIndex((i) => {
            const next = i + 1;
            if (next >= steps.length) {
              setFinished(true);
              return i;
            }
            return next;
          });
          return steps[Math.min(stepIndex + 1, steps.length - 1)]?.seconds ?? 20;
        }
      });
    }, 1000);
    return () => clearInterval(timer);
    
  }, [paused, finished, stopped, phaseIndex, stepIndex, isBreathing]);

  function stopEarly() {
    setStopped(true);
    setFinished(true);
  }

  async function submitFeedback(value: Feedback) {
    setFeedback(value);
    if (!interventionId) return;
    const durationSeconds = Math.round((Date.now() - startedAt.current) / 1000);
    try {
      const result = (await api.updateIntervention(interventionId, {
        completed: !stopped,
        feedback: stopped ? "stopped" : value,
        duration_seconds: durationSeconds,
      })) as { adaptation?: AdaptationOutcome };
      if (result.adaptation) setAdaptation(result.adaptation);
    } catch {
          }
  }

  const title = TITLES[type] ?? "Grounding Exercise";

  if (finished) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 text-center max-w-md mx-auto">
        <h1 className="font-display text-2xl text-[var(--color-navy)]">
          {stopped ? "That's okay." : "Nicely done."}
        </h1>
        <p className="mt-2 text-[var(--color-navy)]/65">
          {stopped ? "You can stop any exercise at any time." : `You completed ${title}.`}
        </p>

        {!feedback && !adaptation && (
          <div className="mt-6 flex flex-col gap-2 w-full">
            <p className="text-sm text-[var(--color-navy)]/55 mb-1">Did this help?</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {FEEDBACK_OPTIONS.map((opt) => (
                <Button key={opt.value} size="sm" variant="secondary" onClick={() => submitFeedback(opt.value)}>
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {adaptation && (
          <div className="mt-6 w-full rounded-2xl bg-white p-5 text-left" style={{ boxShadow: "var(--shadow-soft)" }}>
            <p className="text-sm text-[var(--color-navy)]/80 leading-relaxed">{adaptation.message.content}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {adaptation.recommendation && (
                <Button
                  size="sm"
                  onClick={() => navigate(`/app/exercise/${adaptation.recommendation!.id}`, { state: location.state })}
                >
                  Try {adaptation.recommendation.title}
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => navigate("/app")}>
                Finish
              </Button>
            </div>
          </div>
        )}

        {!adaptation && feedback && (
          <Button className="mt-6" onClick={() => navigate("/app")}>
            Back to Home
          </Button>
        )}

        <Disclaimer compact className="mt-8" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 text-center">
      <h1 className="font-display text-xl text-[var(--color-navy)]">{title}</h1>

      {isBreathing ? (
        <>
          <p className="mt-1 text-sm text-[var(--color-navy)]/55">Inhale for 4s · Hold for 4s · Exhale for 6s</p>
          <div className="mt-8">
            <BreathingCircle phase={BREATH_PHASES[phaseIndex].phase} secondsLeft={secondsLeft} duration={BREATH_PHASES[phaseIndex].seconds} />
          </div>
          <p className="mt-6 text-sm text-[var(--color-navy)]/50">
            {round} / {BREATH_ROUNDS}
          </p>
        </>
      ) : (
        <div className="mt-8 max-w-sm">
          <p className="text-xs uppercase tracking-wide text-[var(--color-navy)]/40">
            Step {stepIndex + 1} of {steps.length}
          </p>
          <h2 className="mt-2 font-display text-xl text-[var(--color-navy)]">{steps[stepIndex]?.title}</h2>
          <p className="mt-3 text-[var(--color-navy)]/65 leading-relaxed">{steps[stepIndex]?.body}</p>
          <p className="mt-5 text-sm text-[var(--color-navy)]/45">{secondsLeft}s</p>
          <div className="mt-4 h-1.5 w-full rounded-full bg-black/5 overflow-hidden">
            <div
              className="h-full bg-[var(--color-teal)] transition-all duration-1000"
              style={{ width: `${((stepIndex + (1 - secondsLeft / (steps[stepIndex]?.seconds || 1))) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-9 flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={paused ? <Play size={15} /> : <Pause size={15} />} onClick={() => setPaused((p) => !p)}>
          {paused ? "Resume" : "Pause"}
        </Button>
        <Button variant="ghost" size="sm" icon={<Square size={14} />} onClick={stopEarly}>
          Stop
        </Button>
      </div>
    </div>
  );
}

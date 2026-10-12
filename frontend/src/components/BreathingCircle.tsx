import { motion, useReducedMotion } from "framer-motion";

export type BreathPhase = "inhale" | "hold" | "exhale";

const PHASE_LABEL: Record<BreathPhase, string> = { inhale: "Inhale", hold: "Hold", exhale: "Exhale" };
const PHASE_SCALE: Record<BreathPhase, number> = { inhale: 1, hold: 1, exhale: 0.62 };

export function BreathingCircle({ phase, secondsLeft, duration }: { phase: BreathPhase; secondsLeft: number; duration: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(circle, var(--color-mint) 0%, transparent 70%)" }}
        animate={reduceMotion ? undefined : { scale: PHASE_SCALE[phase] * 1.15 }}
        transition={{ duration, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute rounded-full border-2"
        style={{ width: 220, height: 220, borderColor: "var(--color-teal)", background: "rgba(75,122,118,0.08)" }}
        animate={reduceMotion ? { scale: 1 } : { scale: PHASE_SCALE[phase] }}
        transition={{ duration, ease: "easeInOut" }}
      />
      <div className="relative flex flex-col items-center justify-center text-center">
        <span className="font-display text-2xl text-[var(--color-navy)]">{PHASE_LABEL[phase]}</span>
        <span className="mt-1 text-sm text-[var(--color-navy)]/55">{secondsLeft}s</span>
      </div>
    </div>
  );
}

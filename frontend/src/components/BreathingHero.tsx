import { motion, useReducedMotion } from "framer-motion";

const RINGS = [
  { r: 150, color: "var(--color-mint)", opacity: 0.35, delay: 0 },
  { r: 112, color: "var(--color-sage)", opacity: 0.4, delay: 0.25 },
  { r: 76, color: "var(--color-teal)", opacity: 0.55, delay: 0.5 },
];

export function BreathingHero({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const cycle = { duration: 9, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <div className={className} aria-hidden="true">
      <svg viewBox="0 0 340 340" width="100%" height="100%" role="presentation">
        {RINGS.map((ring, i) => (
          <motion.circle
            key={i}
            cx="170"
            cy="170"
            r={ring.r}
            fill="none"
            stroke={ring.color}
            strokeWidth={2.5}
            opacity={ring.opacity}
            animate={
              reduceMotion
                ? undefined
                : { r: [ring.r * 0.82, ring.r, ring.r * 0.82], opacity: [ring.opacity * 0.6, ring.opacity, ring.opacity * 0.6] }
            }
            transition={{ ...cycle, delay: ring.delay }}
          />
        ))}
        <motion.circle
          cx="170"
          cy="170"
          r="38"
          fill="var(--color-gold)"
          opacity={0.9}
          animate={reduceMotion ? undefined : { r: [30, 38, 30] }}
          transition={cycle}
        />
        <circle cx="170" cy="170" r="2" fill="var(--color-navy)" opacity={0.4} />
      </svg>
    </div>
  );
}

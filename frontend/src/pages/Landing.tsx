import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Cpu,
  Database,
  Eye,
  HeartHandshake,
  MessageCircle,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { Disclaimer } from "../components/Disclaimer";
import { BreathingHero } from "../components/BreathingHero";

const PIPELINE = [
  { title: "Detect", body: "A message comes in. A local safety check runs on it before anything else does." },
  { title: "Understand", body: "If there's no immediate danger, a local model estimates a broad emotion and stress level." },
  { title: "Ground", body: "An exercise is matched to that estimate — paced breathing, 5-4-3-2-1, or a gentler option." },
  { title: "Adapt", body: "Say it isn't helping, and the next suggestion changes. Nothing repeats itself blindly." },
  { title: "Escalate", body: "If a message suggests real danger, the normal flow stops and human help is shown instead." },
];

const PRINCIPLES = [
  {
    icon: Cpu,
    title: "Processed locally",
    body: "No OpenAI, Gemini, or any other outside AI API is ever called. Classification and responses run on infrastructure you control.",
  },
  {
    icon: ShieldCheck,
    title: "Safety comes first",
    body: "A deterministic, rule-based check runs on every message before any AI output is generated — and can block that output entirely.",
  },
  {
    icon: Eye,
    title: "Estimated, not diagnosed",
    body: "Every AI output is labeled \u201cAI-estimated\u201d and kept separate from what you report yourself. SereneAI never claims a diagnosis.",
  },
  {
    icon: Database,
    title: "Your data, your call",
    body: "Export everything stored about you, or delete your account entirely, from Settings — at any time, no questions asked.",
  },
];

const FEATURES = [
  {
    icon: MessageCircle,
    title: "Real-time support",
    body: "Type or speak what's going on. It's read locally and answered with grounding guidance in moments — no round trip to a third-party API.",
  },
  {
    icon: Sparkles,
    title: "Personalized grounding",
    body: "Exercises are chosen for your current state: breathing for anxiety, 5-4-3-2-1 for overwhelm, a gentler reflection for low mood.",
  },
  {
    icon: HeartHandshake,
    title: "Adaptive by feedback",
    body: "If something isn't working, say so. The next suggestion in that session changes instead of repeating itself.",
  },
];

function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

export function Landing() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <header className="flex items-center justify-between px-5 sm:px-8 py-5 max-w-6xl mx-auto">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-5">
          <Link
            to="/responsible-ai"
            className="hidden sm:inline text-sm font-medium text-[var(--color-navy)]/65 hover:text-[var(--color-navy)] focus-ring rounded-lg px-2 py-1"
          >
            Responsible AI
          </Link>
          <Link to="/login" className="text-sm font-medium text-[var(--color-navy)]/65 hover:text-[var(--color-navy)] focus-ring rounded-lg px-2 py-1">
            Log in
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-navy)] text-[var(--color-cream)] text-sm font-medium px-3.5 py-2 hover:bg-[var(--color-navy-soft)] focus-ring"
          >
            Get Started →
          </Link>
        </nav>
      </header>

      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-8 sm:pt-14 pb-16 sm:pb-20 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-6 items-center">
        <div>
          <p className="text-[var(--color-teal-deep)] font-display italic text-lg mb-4">Take a breath. You're not alone.</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.08] text-[var(--color-navy)]">
            Real support, right when you need it.
          </h1>
          <p className="mt-6 text-base sm:text-lg text-[var(--color-navy)]/70 leading-relaxed max-w-lg">
            SereneAI is an AI-assisted platform for grounding, emotional support, and real-time adaptive
            interventions — built so the safety checks come before the AI, not after.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Link to="/register">
              <Button size="lg">Get Started →</Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="ghost">
                See how it works
              </Button>
            </a>
          </div>

          <div className="mt-9 flex flex-wrap gap-2.5">
            {["Processed locally", "Safety-first design", "Export or delete anytime"].map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-navy)]/12 bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-navy)]/70"
              >
                <ShieldCheck size={13} className="text-[var(--color-teal-deep)]" />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm aspect-square">
          <BreathingHero className="w-full h-full" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="font-display text-sm text-[var(--color-navy)]/55">breathe in</span>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-20 border-t border-[var(--color-navy)]/8">
        <FadeIn>
          <h2 className="font-display text-2xl sm:text-3xl text-[var(--color-navy)] max-w-md">How SereneAI works</h2>
          <p className="mt-3 text-[var(--color-navy)]/65 max-w-md">Five steps, every message, in this order — the order is the point.</p>
        </FadeIn>
        <div className="mt-10 grid sm:grid-cols-5 gap-x-4 gap-y-8">
          {PIPELINE.map((step, i) => (
            <FadeIn key={step.title} delay={reduceMotion ? 0 : i * 0.06}>
              <div className="relative pl-0">
                <div className="flex items-center gap-3 sm:block">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-navy)] text-[var(--color-cream)] font-display text-sm">
                    {i + 1}
                  </span>
                  <h3 className="font-display text-base text-[var(--color-navy)] sm:mt-3">{step.title}</h3>
                </div>
                <p className="mt-2 text-sm text-[var(--color-navy)]/60 leading-relaxed">{step.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="bg-[var(--color-navy)] text-[var(--color-cream)]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <FadeIn>
            <div className="max-w-lg">
              <h2 className="font-display text-2xl sm:text-3xl">Built to be trustworthy, not just helpful.</h2>
              <p className="mt-3 text-[var(--color-cream)]/70 leading-relaxed">
                A wellness app that gets this wrong can cause real harm. These are the commitments SereneAI
                is built around, not just a privacy notice you skip.
              </p>
            </div>
          </FadeIn>

          <div className="mt-10 grid sm:grid-cols-2 gap-5">
            {PRINCIPLES.map(({ icon: Icon, title, body }, i) => (
              <FadeIn key={title} delay={reduceMotion ? 0 : i * 0.06}>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 h-full">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-gold)]/15 text-[var(--color-gold)] mb-4">
                    <Icon size={18} />
                  </span>
                  <h3 className="font-display text-lg">{title}</h3>
                  <p className="mt-2 text-sm text-[var(--color-cream)]/65 leading-relaxed">{body}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <Link
            to="/responsible-ai"
            className="mt-9 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-mint)] hover:text-white focus-ring rounded-lg"
          >
            Read our full responsible AI commitments →
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <FadeIn>
          <div className="rounded-2xl bg-[var(--color-navy)] text-[var(--color-cream)] p-7 sm:p-9 flex flex-col sm:flex-row sm:items-center gap-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-emergency-soft)] text-[var(--color-emergency)]">
              <ShieldAlert size={22} />
            </span>
            <div>
              <h3 className="font-display text-xl">Emergency safety pathway</h3>
              <p className="mt-2 text-sm text-[var(--color-cream)]/70 leading-relaxed max-w-2xl">
                A message that suggests you or someone else may be in immediate danger routes straight to a
                human/medical help screen with a working local emergency number — the AI reply is skipped
                entirely for that message, not softened.
              </p>
            </div>
          </div>
        </FadeIn>

        <div className="mt-5 grid sm:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, body }, i) => (
            <FadeIn key={title} delay={reduceMotion ? 0 : i * 0.06}>
              <div className="rounded-2xl bg-white p-6 h-full" style={{ boxShadow: "var(--shadow-soft)" }}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-mint)] text-[var(--color-teal-deep)] mb-4">
                  <Icon size={19} />
                </span>
                <h3 className="font-display text-lg text-[var(--color-navy)]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-navy)]/65">{body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-5 sm:px-8 pb-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--color-navy)]/8 pt-8">
        <Logo className="opacity-70" />
        <div className="flex flex-col sm:items-end gap-2">
          <Link to="/responsible-ai" className="text-sm font-medium text-[var(--color-teal-deep)] focus-ring rounded">
            Responsible AI
          </Link>
          <Disclaimer className="text-center sm:text-right max-w-md" />
        </div>
      </footer>
    </div>
  );
}

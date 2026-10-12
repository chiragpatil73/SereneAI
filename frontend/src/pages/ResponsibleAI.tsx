import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Cpu,
  Database,
  Eye,
  FileCheck2,
  Globe2,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";

const COMMITMENTS = [
  {
    icon: Cpu,
    title: "Every AI component runs locally",
    body: "Emotion classification is a TF-IDF + Logistic Regression model trained on a small, hand-written demonstration dataset, running inside this app's own backend with scikit-learn. The safety check, stress estimate, exercise selection, and reply wording are plain Python — rules and templates, not a generative model. No message, ever, is sent to OpenAI, Gemini, Claude, Azure AI, or any other outside AI API.",
  },
  {
    icon: ShieldCheck,
    title: "Safety is checked before the AI runs, not after",
    body: "A deterministic, rule-based Safety Engine reads every message first. If it finds language suggesting you or someone else may be in immediate danger, the entire AI pipeline — classifier, stress score, exercise suggestion, generated reply — is skipped for that message. You see a fixed emergency screen with a real local number instead. This ordering is structural, not a content filter layered on top.",
  },
  {
    icon: Eye,
    title: "AI output is always labeled, never asserted as fact",
    body: "Anything the model infers about you is shown as \u201cAI-estimated\u201d and kept visually and functionally separate from what you report yourself in the mood tracker. When there's no assessment yet, the app says so plainly instead of guessing. SereneAI does not diagnose any mental-health or physical condition, and the interface never implies otherwise.",
  },
  {
    icon: Database,
    title: "You can see and remove what's stored",
    body: "Account details, mood entries, chat sessions, AI estimates, and grounding history are stored so the app can personalize your experience — nothing else. From Settings, you can export everything as a file or delete your account outright, and both actions take effect immediately.",
  },
  {
    icon: Globe2,
    title: "Emergency numbers are configurable, not hardcoded",
    body: "The emergency contact shown is read from a small, editable configuration file keyed by country, not hardcoded to one region. If your country isn't listed yet or a number is wrong, that's a config fix, not a rebuild.",
  },
  {
    icon: FileCheck2,
    title: "Limitations are published, not hidden",
    body: "The classifier's accuracy, per-class performance, and confusion matrix are written to a model evaluation report on every training run. It says plainly that the dataset is small, hand-written, English-only, and not clinically validated — because treating a demo model's output as more certain than it is would be its own kind of harm.",
  },
];

export function ResponsibleAI() {
  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <header className="flex items-center justify-between px-5 sm:px-8 py-5 max-w-3xl mx-auto">
        <Link to="/">
          <Logo />
        </Link>
        <Link to="/register">
          <Button size="sm">Get Started →</Button>
        </Link>
      </header>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 pb-20">
        <p className="text-sm font-medium text-[var(--color-teal-deep)] mt-4">Responsible AI</p>
        <h1 className="font-display text-3xl sm:text-4xl text-[var(--color-navy)] mt-2 leading-tight">
          What SereneAI does, and what it deliberately doesn't.
        </h1>
        <p className="mt-5 text-[var(--color-navy)]/70 leading-relaxed max-w-xl">
          This page describes how SereneAI actually works, not a marketing summary of it. Each
          commitment below maps to a real, inspectable part of the codebase.
        </p>

        <div className="mt-10 rounded-2xl border p-5 flex gap-3.5" style={{ borderColor: "var(--color-emergency)", background: "var(--color-emergency-soft)" }}>
          <AlertTriangle size={20} className="shrink-0 mt-0.5" style={{ color: "var(--color-emergency)" }} />
          <p className="text-sm leading-relaxed text-[var(--color-navy)]">
            SereneAI is not a doctor, therapist, psychiatrist, diagnostic system, or emergency service, and
            it does not replace professional medical or mental-health care. If you or someone else may be
            in immediate danger, contact your local emergency number right away.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-6">
          {COMMITMENTS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-4 pb-6 border-b border-[var(--color-navy)]/8 last:border-none">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-mint)] text-[var(--color-teal-deep)]">
                <Icon size={18} />
              </span>
              <div>
                <h2 className="font-display text-lg text-[var(--color-navy)]">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-navy)]/65">{body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl bg-white p-6" style={{ boxShadow: "var(--shadow-soft)" }}>
          <h2 className="font-display text-lg text-[var(--color-navy)]">Where the limits are</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--color-navy)]/65 leading-relaxed list-disc pl-5">
            <li>The emotion model is trained on roughly 300 hand-written English sentences — not a clinical or demographically representative sample.</li>
            <li>Stress and anxiety scores are a transparent, documented heuristic, not a medical measurement.</li>
            <li>The safety check is pattern-based. It will miss some real risk and occasionally flag none. It is a safety net, not a guarantee.</li>
            <li>An emergency screen points you toward real help — it cannot call anyone or verify that help arrived.</li>
          </ul>
        </div>

        <p className="mt-10 text-sm text-[var(--color-navy)]/50 text-center">
          Questions about how a specific part works are answered in the project's README and test suite.
        </p>
      </div>
    </div>
  );
}

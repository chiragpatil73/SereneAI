import { AlertTriangle, Phone, Stethoscope, Users } from "lucide-react";
import type { EmergencyPayload } from "../types";

export function EmergencyPanel({ payload, onClose }: { payload: EmergencyPayload; onClose: () => void }) {
  const { services } = payload;
  const tel = (n: string) => `tel:${n.replace(/\s/g, "")}`;

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto"
      style={{ background: "var(--color-emergency-soft)" }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="emergency-title"
    >
      <div className="min-h-full flex items-start sm:items-center justify-center p-5 sm:p-8">
        <div
          className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 border-2"
          style={{ borderColor: "var(--color-emergency)" }}
        >
          <div className="flex items-center gap-3 mb-2">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full shrink-0"
              style={{ background: "var(--color-emergency-soft)" }}
            >
              <AlertTriangle size={20} style={{ color: "var(--color-emergency)" }} />
            </span>
            <h1 id="emergency-title" className="font-display text-xl" style={{ color: "var(--color-navy)" }}>
              {payload.title}
            </h1>
          </div>

          <p className="text-sm leading-relaxed text-[var(--color-navy)]/85 mt-3">{payload.body}</p>
          <p className="text-sm leading-relaxed text-[var(--color-navy)]/85 mt-3">{payload.category_line}</p>

          <div className="mt-6 grid gap-3">
            <a
              href={tel(services.emergency_number)}
              className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-white font-medium"
              style={{ background: "var(--color-emergency)" }}
            >
              <Phone size={20} />
              <span className="flex-1 text-left">
                Call {services.emergency_label}
                <span className="block text-xs font-normal opacity-90">{services.name}</span>
              </span>
              <span className="text-lg font-display">{services.emergency_number}</span>
            </a>

            {services.helplines.map((h) => (
              <a
                key={h.number}
                href={tel(h.number)}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 border-2 font-medium"
                style={{ borderColor: "var(--color-navy)", color: "var(--color-navy)" }}
              >
                <Users size={20} />
                <span className="flex-1 text-left">{h.name}</span>
                <span className="text-base font-display">{h.number}</span>
              </a>
            ))}

            <button
              type="button"
              onClick={() => {
                const to = window.prompt(
                  "Enter a trusted contact's number to call, or cancel to go back."
                );
                if (to) window.location.href = tel(to);
              }}
              className="flex items-center gap-3 rounded-xl px-4 py-3.5 border-2 font-medium focus-ring"
              style={{ borderColor: "var(--color-navy)", color: "var(--color-navy)" }}
            >
              <Users size={20} />
              <span className="flex-1 text-left">Contact Someone You Trust</span>
            </button>
          </div>

          <div className="mt-6 flex items-start gap-2.5 text-sm text-[var(--color-navy)]/75 rounded-xl bg-[var(--color-mint)] p-3.5">
            <Stethoscope size={18} className="mt-0.5 shrink-0" />
            <p>{payload.medical_notice}</p>
          </div>

          <p className="mt-5 text-xs text-[var(--color-navy)]/55">{payload.disclaimer}</p>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full text-center text-sm underline text-[var(--color-navy)]/60 focus-ring rounded-lg py-2"
          >
            I'm safe for now — return to SereneAI
          </button>
        </div>
      </div>
    </div>
  );
}

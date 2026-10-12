import { HeartHandshake, Phone } from "lucide-react";
import type { EmergencyServices } from "../types";

export function SafetyAlert({ support }: { support: EmergencyServices }) {
  return (
    <div
      className="rounded-2xl border p-4 sm:p-5 flex flex-col gap-3"
      style={{ background: "var(--color-emergency-soft)", borderColor: "var(--color-emergency)" }}
      role="note"
    >
      <div className="flex items-start gap-3">
        <HeartHandshake size={20} className="mt-0.5 shrink-0" style={{ color: "var(--color-emergency)" }} />
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--color-navy)" }}>
            If things feel like more than you can carry, real support helps.
          </p>
          <p className="text-sm mt-1 text-[var(--color-navy)]/70">
            You can reach {support.name} {support.emergency_label} on{" "}
            <a href={`tel:${support.emergency_number.replace(/\s/g, "")}`} className="underline font-medium">
              {support.emergency_number}
            </a>
            {support.helplines[0] && (
              <>
                , or {support.helplines[0].name} on{" "}
                <a href={`tel:${support.helplines[0].number.replace(/\s/g, "")}`} className="underline font-medium">
                  {support.helplines[0].number}
                </a>
              </>
            )}
            .
          </p>
        </div>
      </div>
      <a
        href={`tel:${support.emergency_number.replace(/\s/g, "")}`}
        className="self-start inline-flex items-center gap-2 text-sm font-medium rounded-lg px-3 py-2 text-white"
        style={{ background: "var(--color-emergency)" }}
      >
        <Phone size={15} /> Call {support.emergency_label}
      </a>
    </div>
  );
}

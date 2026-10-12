import { useEffect, useState } from "react";
import { Mic, MicOff, Send } from "lucide-react";
import { useVoiceInput } from "../hooks/useSpeech";
import { cn } from "../utils/cn";

export function ChatInput({ onSend, disabled }: { onSend: (text: string) => void; disabled?: boolean }) {
  const [text, setText] = useState("");
  const { supported, listening, interim, start, stop } = useVoiceInput((finalText) => {
    setText((prev) => (prev ? prev + " " + finalText : finalText));
  });

  useEffect(() => {
    if (!listening) return;
  }, [listening]);

  function submit() {
    const value = text.trim();
    if (!value || disabled) return;
    onSend(value);
    setText("");
  }

  return (
    <div className="border-t border-[var(--color-navy)]/8 bg-white/70 backdrop-blur px-3 sm:px-4 py-3">
      <div className="flex items-end gap-2 rounded-2xl border border-[var(--color-navy)]/12 bg-white px-3 py-2 focus-within:border-[var(--color-teal)]">
        <textarea
          value={listening && interim ? `${text} ${interim}`.trim() : text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm py-1.5 outline-none placeholder:text-[var(--color-navy)]/40 max-h-32"
        />
        {supported && (
          <button
            type="button"
            aria-label={listening ? "Stop voice input" : "Speak instead"}
            onClick={listening ? stop : start}
            className={cn(
              "shrink-0 rounded-full p-2 focus-ring transition-colors",
              listening ? "bg-[var(--color-emergency-soft)] text-[var(--color-emergency)]" : "hover:bg-black/5 text-[var(--color-navy)]/60"
            )}
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        )}
        <button
          type="button"
          aria-label="Send"
          onClick={submit}
          disabled={disabled || !text.trim()}
          className="shrink-0 rounded-full p-2.5 bg-[var(--color-navy)] text-[var(--color-cream)] disabled:opacity-40 focus-ring"
        >
          <Send size={16} />
        </button>
      </div>
      <p className="mt-1.5 text-[11px] text-center text-[var(--color-navy)]/40">
        {supported ? "Or speak instead" : "Voice input isn't supported by this browser. You can type instead."}
      </p>
    </div>
  );
}

import { cn } from "../utils/cn";
import { formatTime } from "../utils/format";
import type { ChatMessage } from "../types";

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.sender === "user";
  const isSystem = message.sender === "system";
  if (isSystem) {
    return (
      <div className="mx-auto max-w-sm text-center text-xs text-[var(--color-navy)]/50 py-1">{message.content}</div>
    );
  }
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-[var(--color-navy)] text-[var(--color-cream)] rounded-br-sm"
            : "bg-white border border-[var(--color-navy)]/8 text-[var(--color-navy)] rounded-bl-sm"
        )}
        style={!isUser ? { boxShadow: "var(--shadow-soft)" } : undefined}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.timestamp && (
          <p className={cn("mt-1 text-[10px]", isUser ? "text-[var(--color-cream)]/50" : "text-[var(--color-navy)]/35")}>
            {formatTime(message.timestamp)}
          </p>
        )}
      </div>
    </div>
  );
}

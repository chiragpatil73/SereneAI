import { getToken, api } from "./api";
import type { AnalyzeResult } from "../types";

export type WsStatusStage = "listening" | "understanding" | "preparing";
export type WsFrame =
  | { type: "status"; stage: WsStatusStage; message: string }
  | { type: `result:${"response" | "emergency"}` } & AnalyzeResult
  | { type: "error"; message: string };

export function connectChatSocket(
  sessionId: number | null,
  handlers: { onFrame: (frame: WsFrame) => void; onOpen?: () => void; onClose?: () => void }
): { send: (message: string, userReportedStress?: number | null) => void; close: () => void } | null {
  const token = getToken();
  if (!token) return null;
  const wsBase = api.base.replace(/^http/, "ws");
  const params = new URLSearchParams({ token });
  if (sessionId) params.set("session_id", String(sessionId));
  const socket = new WebSocket(`${wsBase}/ws/chat?${params.toString()}`);

  socket.onopen = () => handlers.onOpen?.();
  socket.onclose = () => handlers.onClose?.();
  socket.onmessage = (event) => {
    try {
      handlers.onFrame(JSON.parse(event.data));
    } catch {
          }
  };

  return {
    send: (message: string, userReportedStress?: number | null) => {
      if (socket.readyState !== WebSocket.OPEN) return;
      socket.send(JSON.stringify({ message, session_id: sessionId, user_reported_stress: userReportedStress ?? null }));
    },
    close: () => socket.close(),
  };
}

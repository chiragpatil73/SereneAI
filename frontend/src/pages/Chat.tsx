import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Wind, LogOut } from "lucide-react";
import { ChatBubble } from "../components/ChatBubble";
import { ChatInput } from "../components/ChatInput";
import { EmergencyPanel } from "../components/EmergencyPanel";
import { SafetyAlert } from "../components/SafetyAlert";
import { Button } from "../components/Button";
import { api } from "../services/api";
import { connectChatSocket, type WsFrame } from "../services/ws";
import { useTextToSpeech } from "../hooks/useSpeech";
import type { ChatMessage, EmergencyPayload, EmergencyServices, Intervention } from "../types";

export function Chat() {
  const location = useLocation() as { state?: { sessionId?: number } };
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<number | null>(location.state?.sessionId ?? null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [recommendation, setRecommendation] = useState<Intervention | null>(null);
  const [support, setSupport] = useState<EmergencyServices | null>(null);
  const [emergency, setEmergency] = useState<EmergencyPayload | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<ReturnType<typeof connectChatSocket>>(null);
  const { speak } = useTextToSpeech();

  useEffect(() => {
    if (sessionId == null) return;
    (async () => {
      try {
        const detail = await fetch(`${api.base}/api/sessions/${sessionId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("sereneai_token") ?? ""}` },
        }).then((r) => (r.ok ? r.json() : null));
        if (detail?.messages) setMessages(detail.messages);
      } catch {
              }
    })();
  }, [sessionId]);

  const handleFrame = useCallback(
    (frame: WsFrame) => {
      if (frame.type === "status") {
        setStatus(frame.message);
        return;
      }
      if (frame.type === "error") {
        setStatus(null);
        setSending(false);
        return;
      }
      setStatus(null);
      setSending(false);
      const result = frame as unknown as import("../types").AnalyzeResult;
      setSessionId(result.session_id);
      setMessages((prev) => [...prev, result.message]);
      if (result.type === "emergency" && result.emergency) {
        setEmergency(result.emergency);
        setRecommendation(null);
        setSupport(null);
      } else {
        setRecommendation(result.recommendation);
        setSupport(result.support);
        speak(result.message.content);
      }
    },
    [speak]
  );

  useEffect(() => {
    const socket = connectChatSocket(sessionId, {
      onFrame: handleFrame,
      onOpen: () => setWsConnected(true),
      onClose: () => setWsConnected(false),
    });
    socketRef.current = socket;
    return () => socket?.close();
    
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  async function sendMessage(text: string) {
    setMessages((prev) => [...prev, { id: null, sender: "user", content: text, timestamp: new Date().toISOString() }]);
    setSending(true);
    if (socketRef.current && wsConnected) {
      setStatus("Listening...");
      socketRef.current.send(text);
      return;
    }
    
    try {
      setStatus("Understanding...");
      const result = await api.analyze({ message: text, session_id: sessionId });
      setSessionId(result.session_id);
      setStatus(null);
      setSending(false);
      if (result.type === "emergency" && result.emergency) {
        setEmergency(result.emergency);
        setRecommendation(null);
        setSupport(null);
      } else {
        setMessages((prev) => [...prev, result.message]);
        setRecommendation(result.recommendation);
        setSupport(result.support);
      }
    } catch {
      setStatus(null);
      setSending(false);
    }
  }

  async function endSession() {
    if (sessionId) {
      try {
        await api.endSession(sessionId);
      } catch {
              }
    }
    navigate("/app");
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {emergency && <EmergencyPanel payload={emergency} onClose={() => setEmergency(null)} />}

      <header className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-[var(--color-navy)]/8 bg-white/70 backdrop-blur">
        <div>
          <h1 className="font-display text-lg text-[var(--color-navy)]">Chat with SereneAI</h1>
          <p className="text-xs text-[var(--color-navy)]/50 flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${wsConnected ? "bg-[var(--color-sage)]" : "bg-[var(--color-gold)]"}`} />
            {wsConnected ? "Online" : "Online (standard mode)"}
          </p>
        </div>
        <Button size="sm" variant="ghost" icon={<LogOut size={14} />} onClick={endSession}>
          End Session
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 flex flex-col gap-3 max-w-2xl w-full mx-auto">
        {messages.length === 0 && !status && (
          <p className="text-center text-sm text-[var(--color-navy)]/45 mt-10">
            Say whatever's on your mind. There's no wrong way to start.
          </p>
        )}
        {messages.map((m, i) => (
          <ChatBubble key={m.id ?? `${i}-${m.content.slice(0, 12)}`} message={m} />
        ))}
        {status && (
          <div className="flex items-center gap-2 text-xs text-[var(--color-navy)]/45 pl-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-teal)] animate-pulse" />
            {status}
          </div>
        )}

        {support && <SafetyAlert support={support} />}

        {recommendation && (
          <div className="self-start flex items-center gap-2 rounded-xl border border-[var(--color-navy)]/10 bg-white px-3.5 py-2.5 mt-1">
            <Wind size={16} className="text-[var(--color-teal-deep)]" />
            <span className="text-sm text-[var(--color-navy)]/75">{recommendation.title}</span>
            <Button size="sm" variant="secondary" onClick={() => navigate(`/app/exercise/${recommendation.id}`, { state: { sessionId } })}>
              Start Grounding
            </Button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={sendMessage} disabled={sending} />
    </div>
  );
}

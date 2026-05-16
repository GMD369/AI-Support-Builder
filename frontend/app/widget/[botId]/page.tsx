"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

type LocalMessage = { role: "user" | "assistant"; content: string };

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function BotIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="5" y="7" width="14" height="11" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 4v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="9.5" cy="12.5" r="1" fill="currentColor" />
      <circle cx="14.5" cy="12.5" r="1" fill="currentColor" />
    </svg>
  );
}

function HandshakeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-7 w-7">
      <path d="M4.5 9.5 8 6a2 2 0 0 1 2.8 0l1.2 1.2a2 2 0 0 0 2.8 0l.4-.4a2 2 0 0 1 2.8 0L21 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m7.5 11.5 3.2 3.2a2 2 0 0 0 2.8 0l.8-.8a2 2 0 0 1 2.8 0l.4.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 10.5 7 14a2 2 0 0 0 2.8 0l.2-.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function WidgetPage() {
  const params = useParams();
  const botId = params.botId as string;

  const [botName, setBotName] = useState("AI Assistant");
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API}/public/bots/${botId}`)
      .then((r) => r.json())
      .then((d: { name?: string }) => {
        if (d.name) setBotName(d.name);
      })
      .catch(() => {});
  }, [botId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || sending) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setSending(true);

    try {
      const res = await fetch(`${API}/public/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          bot_id: botId,
          conversation_id: conversationId,
        }),
      });
      const data = (await res.json()) as { answer?: string; conversation_id?: string; detail?: string };
      if (!res.ok) throw new Error(data.detail ?? "Request failed");
      setConversationId(data.conversation_id ?? null);
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer ?? "" }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="flex h-screen flex-col bg-white" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div
        style={{ background: "#0A4F8F" }}
        className="flex shrink-0 items-center gap-3 px-4 py-3"
      >
        <div
          style={{ background: "rgba(255,255,255,0.2)" }}
          className="flex h-8 w-8 items-center justify-center rounded-full text-white"
        >
          <BotIcon />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-bold text-white">{botName}</p>
          <p className="text-xs text-blue-200">AI Support · Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "#F8FAFF" }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center pt-8">
            <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#BAE6FD] bg-white text-[#0A4F8F]">
              <HandshakeIcon />
            </div>
            <p className="text-sm font-semibold" style={{ color: "#0A4F8F" }}>
              Hi! How can I help you?
            </p>
            <p className="text-xs mt-1" style={{ color: "#1D7FC4" }}>
              Ask me anything — I&apos;m here to help.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed"
              style={
                msg.role === "user"
                  ? { background: "#0A4F8F", color: "#fff" }
                  : { background: "#fff", color: "#0A4F8F", border: "1px solid #BAE6FD" }
              }
            >
              {msg.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div
              className="rounded-2xl px-3 py-2 text-sm"
              style={{ background: "#fff", color: "#1D7FC4", border: "1px solid #BAE6FD" }}
            >
              <span className="animate-pulse">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t p-3" style={{ borderColor: "#BAE6FD", background: "#fff" }}>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            disabled={sending}
            className="flex-1 rounded-full border px-4 py-2 text-sm focus:outline-none"
            style={{ borderColor: "#BAE6FD", color: "#0A4F8F" }}
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="rounded-full px-4 py-2 text-sm font-bold text-white transition-opacity disabled:opacity-40"
            style={{ background: "#0A4F8F" }}
          >
            Send
          </button>
        </div>
        <p className="mt-1.5 text-center text-xs" style={{ color: "#BAE6FD" }}>
          Powered by AI Support Builder
        </p>
      </div>
    </div>
  );
}

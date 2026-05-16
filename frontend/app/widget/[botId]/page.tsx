"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

type Msg = { role: "user" | "assistant"; content: string };

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type BotInfo = {
  name: string;
  display_name: string | null;
  welcome_message: string | null;
  widget_color: string | null;
  lead_capture_enabled: boolean;
};

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
      <path d="M22 2 11 13M22 2 15 22 11 13 2 9l20-7Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function WidgetPage() {
  const params = useParams();
  const botId = params.botId as string;

  const [botInfo, setBotInfo] = useState<BotInfo>({ name: "AI Assistant", display_name: null, welcome_message: null, widget_color: null, lead_capture_enabled: false });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadError, setLeadError] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const accentColor = botInfo.widget_color ?? "#6366f1";
  const displayName = botInfo.display_name ?? botInfo.name;
  const welcomeMsg = botInfo.welcome_message ?? "Hi there! 👋 How can I help you today?";
  const showChat = !botInfo.lead_capture_enabled || leadSubmitted;

  useEffect(() => {
    fetch(`${API}/public/bots/${botId}`)
      .then((r) => r.json())
      .then((d: Partial<BotInfo> & { name?: string }) => {
        setBotInfo({
          name: d.name ?? "AI Assistant",
          display_name: d.display_name ?? null,
          welcome_message: d.welcome_message ?? null,
          widget_color: d.widget_color ?? null,
          lead_capture_enabled: d.lead_capture_enabled ?? false,
        });
      })
      .catch(() => {});
  }, [botId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEmail.trim()) { setLeadError("Email is required"); return; }
    setLeadSubmitting(true); setLeadError("");
    try {
      const res = await fetch(`${API}/public/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bot_id: botId, name: leadName.trim() || null, email: leadEmail.trim() }),
      });
      if (!res.ok) throw new Error();
      setLeadSubmitted(true);
    } catch { setLeadError("Something went wrong. Please try again."); }
    finally { setLeadSubmitting(false); }
  };

  const handleSend = async () => {
    const question = input.trim();
    if (!question || sending) return;
    setInput("");
    const updated: Msg[] = [...messages, { role: "user", content: question }];
    setMessages(updated);
    setSending(true);
    try {
      const res = await fetch(`${API}/public/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question, bot_id: botId, conversation_id: conversationId,
          history: updated.slice(-10).map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = (await res.json()) as { answer?: string; conversation_id?: string; detail?: string };
      if (!res.ok) throw new Error(data.detail);
      setConversationId(data.conversation_id ?? null);
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer ?? "" }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally { setSending(false); }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); void handleSend(); }
  };

  return (
    <div className="flex h-screen flex-col" style={{ fontFamily: "var(--font-geist-sans, 'Inter', system-ui, sans-serif)", background: "#f8fafc" }}>
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 px-4 py-3.5" style={{ background: accentColor }}>
        <div className="relative flex-shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="white" strokeWidth="1.6">
              <rect x="5" y="7" width="14" height="11" rx="3" />
              <path d="M12 4v3" strokeLinecap="round" />
              <circle cx="9.5" cy="12.5" r="1" fill="white" stroke="none" />
              <circle cx="14.5" cy="12.5" r="1" fill="white" stroke="none" />
            </svg>
          </div>
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white" style={{ background: "#10b981" }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white leading-none">{displayName}</p>
          <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Typically replies instantly</p>
        </div>
      </div>

      {/* Lead capture gate */}
      {!showChat ? (
        <div className="flex flex-1 items-center justify-center p-5">
          <div className="w-full slide-up" style={{ maxWidth: 320 }}>
            <div className="mb-5 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: `${accentColor}15` }}>
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke={accentColor} strokeWidth="1.6">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-base font-bold" style={{ color: "#0f172a" }}>Before we chat…</p>
              <p className="mt-1 text-xs" style={{ color: "#64748b" }}>Enter your details to get started</p>
            </div>
            <form onSubmit={handleLeadSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold" style={{ color: "#374151" }}>
                  Name <span style={{ color: "#94a3b8" }}>(optional)</span>
                </label>
                <input
                  type="text" value={leadName} onChange={(e) => setLeadName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
                  style={{ border: "1.5px solid #e2e8f0", color: "#0f172a", background: "#fff" }}
                  onFocus={(e) => { e.target.style.borderColor = accentColor; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold" style={{ color: "#374151" }}>
                  Email <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="email" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
                  style={{ border: "1.5px solid #e2e8f0", color: "#0f172a", background: "#fff" }}
                  onFocus={(e) => { e.target.style.borderColor = accentColor; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }}
                />
              </div>
              {leadError && <p className="text-xs" style={{ color: "#ef4444" }}>{leadError}</p>}
              <button
                type="submit" disabled={leadSubmitting}
                className="w-full rounded-xl py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: accentColor }}
              >
                {leadSubmitting ? "Please wait…" : "Start Chatting →"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="fade-in flex flex-col items-center justify-center h-full text-center py-8">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: `${accentColor}15` }}>
                  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke={accentColor} strokeWidth="1.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-sm font-semibold" style={{ color: "#0f172a" }}>{welcomeMsg}</p>
                <p className="mt-1 text-xs" style={{ color: "#94a3b8" }}>Ask me anything — I&apos;m here to help.</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`fade-in flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-end gap-2`}>
                {msg.role === "assistant" && (
                  <div className="mb-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full" style={{ background: accentColor }}>
                    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="white" strokeWidth="1.8">
                      <rect x="5" y="7" width="14" height="11" rx="3" />
                      <circle cx="9.5" cy="12.5" r="1" fill="white" stroke="none" />
                      <circle cx="14.5" cy="12.5" r="1" fill="white" stroke="none" />
                    </svg>
                  </div>
                )}
                <div
                  className="max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                  style={
                    msg.role === "user"
                      ? { background: accentColor, color: "#fff", borderBottomRightRadius: 4 }
                      : { background: "#fff", color: "#0f172a", border: "1px solid #e2e8f0", borderBottomLeftRadius: 4, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex items-end gap-2">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full" style={{ background: accentColor }}>
                  <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="white" strokeWidth="1.8">
                    <rect x="5" y="7" width="14" height="11" rx="3" />
                    <circle cx="9.5" cy="12.5" r="1" fill="white" stroke="none" />
                    <circle cx="14.5" cy="12.5" r="1" fill="white" stroke="none" />
                  </svg>
                </div>
                <div className="flex items-center gap-1 rounded-2xl px-4 py-3" style={{ background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", borderBottomLeftRadius: 4 }}>
                  <span className="h-1.5 w-1.5 rounded-full typing-dot" style={{ background: "#94a3b8" }} />
                  <span className="h-1.5 w-1.5 rounded-full typing-dot" style={{ background: "#94a3b8" }} />
                  <span className="h-1.5 w-1.5 rounded-full typing-dot" style={{ background: "#94a3b8" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 p-3" style={{ background: "#fff", borderTop: "1px solid #e2e8f0" }}>
            <div className="flex items-center gap-2 rounded-2xl px-4 py-2" style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0" }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                placeholder="Type a message…"
                disabled={sending}
                className="flex-1 bg-transparent text-sm focus:outline-none disabled:opacity-50"
                style={{ color: "#0f172a" }}
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-white transition-opacity disabled:opacity-30"
                style={{ background: accentColor }}
              >
                <SendIcon />
              </button>
            </div>
            <p className="mt-2 text-center text-xs" style={{ color: "#cbd5e1" }}>
              Powered by <span style={{ color: "#94a3b8" }}>AI Support Builder</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

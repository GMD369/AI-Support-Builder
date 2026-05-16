"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getBot,
  listDocuments,
  uploadDocument,
  deleteDocument,
  sendMessage,
  listConversations,
  getConversation,
  deleteConversation,
  updateBot,
  getBotAnalytics,
  getBotLeads,
} from "@/app/lib/api";
import type {
  Bot,
  BotAnalytics,
  Lead,
  DocumentFile,
  LocalMessage,
  Conversation,
  ConversationDetail,
} from "@/app/types";

type Tab = "chat" | "documents" | "conversations" | "analytics" | "customize" | "leads" | "embed";

function PlusIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M10 4.5v11M4.5 10h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRightIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M4.5 10h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M11 6.5L14.5 10 11 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FileIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M7 3.5h7.5L19.5 8v12.5A1.5 1.5 0 0 1 18 22H7A1.5 1.5 0 0 1 5.5 20.5V5A1.5 1.5 0 0 1 7 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14.5 3.5V8H19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 12H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ChatIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M5 5.5h14A1.5 1.5 0 0 1 20.5 7v8A1.5 1.5 0 0 1 19 16.5H10L6 20v-3.5H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function LogsIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="5" y="4.5" width="14" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 9.5h7M8.5 13h7M8.5 16.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function EmbedIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M8.5 9 5 12.5 8.5 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5 9 19 12.5 15.5 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.5 6.5 10.5 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function AnalyticsIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M4 18V10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 18V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14 18V12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M19 18V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function LeadsIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 19c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17 11l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CustomizeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M4 7h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9.5 4.5h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M8 7l.7 11.2c.05.8.71 1.3 1.5 1.3h3.6c.79 0 1.45-.5 1.5-1.3L16 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.8" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export default function BotDetailPage() {
  const params = useParams();
  const botId = params.botId as string;
  const router = useRouter();

  const [bot, setBot] = useState<Bot | null>(null);
  const [loadingBot, setLoadingBot] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("chat");

  // ── Chat state ──────────────────────────────────────────────────────────────
  const [chatMessages, setChatMessages] = useState<LocalMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Documents state ─────────────────────────────────────────────────────────
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // ── Conversations state ─────────────────────────────────────────────────────
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convsLoading, setConvsLoading] = useState(false);
  const [selectedConv, setSelectedConv] = useState<ConversationDetail | null>(null);
  const [convLoading, setConvLoading] = useState(false);

  // ── Analytics state ─────────────────────────────────────────────────────────
  const [analytics, setAnalytics] = useState<BotAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // ── Leads state ─────────────────────────────────────────────────────────────
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);

  // ── Customize state ─────────────────────────────────────────────────────────
  const [displayName, setDisplayName] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [widgetColor, setWidgetColor] = useState("#0A4F8F");
  const [leadCaptureEnabled, setLeadCaptureEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Embed state ─────────────────────────────────────────────────────────────
  const [origin, setOrigin] = useState("");
  const [scriptCopied, setScriptCopied] = useState(false);
  const [iframeCopied, setIframeCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const b = await getBot(botId);
        setBot(b);
        setDisplayName(b.display_name ?? b.name);
        setWelcomeMessage(b.welcome_message ?? "Hi! How can I help you?");
        setWidgetColor(b.widget_color ?? "#0A4F8F");
        setLeadCaptureEnabled(b.lead_capture_enabled ?? false);
      } catch {
        router.replace("/dashboard/bots");
      } finally {
        setLoadingBot(false);
      }
    };
    void load();
    setOrigin(window.location.origin);
  }, [botId, router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, sending]);

  useEffect(() => {
    if (activeTab === "documents") void loadDocuments();
    if (activeTab === "conversations") void loadConversations();
    if (activeTab === "analytics") void loadAnalytics();
    if (activeTab === "leads") void loadLeads();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDocuments = async () => {
    setDocsLoading(true);
    try { setDocuments(await listDocuments(botId)); } catch { /**/ } finally { setDocsLoading(false); }
  };

  const loadConversations = async () => {
    setConvsLoading(true);
    try { setConversations(await listConversations(botId)); } catch { /**/ } finally { setConvsLoading(false); }
  };

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try { setAnalytics(await getBotAnalytics(botId)); } catch { /**/ } finally { setAnalyticsLoading(false); }
  };

  const loadLeads = async () => {
    setLeadsLoading(true);
    try { setLeads(await getBotLeads(botId)); } catch { /**/ } finally { setLeadsLoading(false); }
  };

  // ── Chat handlers ──────────────────────────────────────────────────────────

  const handleSend = async () => {
    const question = chatInput.trim();
    if (!question || sending) return;
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: question }]);
    setSending(true);
    try {
      const result = await sendMessage(question, botId, currentConversationId ?? undefined);
      setCurrentConversationId(result.conversation_id);
      setChatMessages((prev) => [...prev, { role: "assistant", content: result.answer, sources: result.sources }]);
    } catch (e) {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: e instanceof Error ? e.message : "Something went wrong." },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleSend(); }
  };

  // ── Document handlers ──────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true); setUploadSuccess(null); setUploadError(null);
    try {
      const result = await uploadDocument(botId, selectedFile);
      setUploadSuccess(`"${result.filename}" uploaded — ${result.chunks_created} chunks created`);
      setSelectedFile(null);
      void loadDocuments();
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (filename: string) => {
    if (!confirm(`Delete "${filename}"? This removes all its knowledge chunks.`)) return;
    try {
      await deleteDocument(filename, botId);
      setDocuments((prev) => prev.filter((d) => d.filename !== filename));
    } catch (e) { alert(e instanceof Error ? e.message : "Delete failed"); }
  };

  // ── Conversation handlers ──────────────────────────────────────────────────

  const handleSelectConv = async (convId: string) => {
    if (selectedConv?.id === convId) return;
    setConvLoading(true); setSelectedConv(null);
    try { setSelectedConv(await getConversation(convId)); } catch { /**/ } finally { setConvLoading(false); }
  };

  const handleDeleteConv = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this conversation?")) return;
    try {
      await deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (selectedConv?.id === convId) setSelectedConv(null);
    } catch { alert("Failed to delete conversation"); }
  };

  // ── Customize handler ──────────────────────────────────────────────────────

  const handleSaveCustomization = async () => {
    setSaving(true); setSaveSuccess(false);
    try {
      const updated = await updateBot(botId, {
        display_name: displayName,
        welcome_message: welcomeMessage,
        widget_color: widgetColor,
        lead_capture_enabled: leadCaptureEnabled,
      });
      setBot(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) { alert(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  };

  // ── Embed helpers ──────────────────────────────────────────────────────────

  const widgetUrl = `${origin}/widget/${botId}`;

  const scriptCode = `<script>
(function(d,botId,widgetUrl){
  var c=d.createElement('div');
  c.style.cssText='position:fixed;bottom:24px;right:24px;z-index:2147483647;';
  var f=d.createElement('iframe');
  f.src=widgetUrl;
  f.style.cssText='display:none;position:absolute;bottom:68px;right:0;width:380px;height:540px;border:none;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.16);';
  var btn=d.createElement('button');
  btn.style.cssText='width:56px;height:56px;border-radius:50%;background:#0A4F8F;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(10,79,143,0.45);';
  btn.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" fill="white" width="26" height="26" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';
  var open=false;
  btn.onclick=function(){open=!open;f.style.display=open?'block':'none';};
  c.appendChild(f);c.appendChild(btn);d.body.appendChild(c);
})(document,'${botId}','${widgetUrl}');
<\/script>`.trim();

  const iframeCode = `<iframe
  src="${widgetUrl}"
  width="400"
  height="600"
  frameborder="0"
  style="border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.12);"
></iframe>`.trim();

  const copy = async (text: string, setCopied: (v: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loadingBot) {
    return (
      <div className="flex h-full items-center justify-center" style={{ background: "#f1f5f9" }}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-10 w-10 animate-spin rounded-full"
            style={{ border: "3px solid #e2e8f0", borderTopColor: "#6366f1" }}
          />
          <p className="text-sm font-medium" style={{ color: "#64748b" }}>Loading bot...</p>
        </div>
      </div>
    );
  }
  if (!bot) return null;

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "chat", label: "Chat", icon: <ChatIcon className="h-4 w-4" /> },
    { key: "documents", label: "Documents", icon: <FileIcon className="h-4 w-4" /> },
    { key: "conversations", label: "Logs", icon: <LogsIcon className="h-4 w-4" /> },
    { key: "analytics", label: "Analytics", icon: <AnalyticsIcon className="h-4 w-4" /> },
    { key: "customize", label: "Customize", icon: <CustomizeIcon className="h-4 w-4" /> },
    { key: "leads", label: "Leads", icon: <LeadsIcon className="h-4 w-4" /> },
    { key: "embed", label: "Embed", icon: <EmbedIcon className="h-4 w-4" /> },
  ];

  return (
    <div className="flex h-full flex-col" style={{ background: "#f1f5f9" }}>

      {/* ── Page Header ── */}
      <div
        className="flex-shrink-0 px-6 pt-5 pb-0"
        style={{ background: "#f1f5f9" }}
      >
        <div
          className="rounded-2xl px-6 pt-5 pb-0"
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
          }}
        >
          {/* Breadcrumb */}
          <div className="mb-1 flex items-center gap-2">
            <button
              onClick={() => router.push("/dashboard/bots")}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium transition-all duration-150 hover:-translate-y-0.5"
              style={{ color: "#6366f1" }}
            >
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                <path d="M15.5 10h-10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M9 6.5 5.5 10 9 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Bots
            </button>
            <span style={{ color: "#e2e8f0" }}>/</span>
            <span className="text-sm font-semibold" style={{ color: "#0f172a" }}>{bot.name}</span>
          </div>

          {bot.description && (
            <p className="mb-3 text-xs" style={{ color: "#94a3b8" }}>{bot.description}</p>
          )}

          {/* Tab bar */}
          <div className="flex flex-wrap gap-1 pt-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-1.5 rounded-t-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150"
                style={
                  activeTab === tab.key
                    ? {
                        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                        color: "#ffffff",
                        boxShadow: "0 2px 8px rgba(99,102,241,0.25)",
                      }
                    : {
                        color: "#64748b",
                        background: "transparent",
                      }
                }
                onMouseEnter={(e) => {
                  if (activeTab !== tab.key) {
                    (e.currentTarget as HTMLButtonElement).style.color = "#6366f1";
                    (e.currentTarget as HTMLButtonElement).style.background = "#f1f5f9";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.key) {
                    (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="min-h-0 flex-1 overflow-hidden">

        {/* ════════ CHAT TAB ════════ */}
        {activeTab === "chat" && (
          <div className="flex h-full flex-col">
            {/* Chat toolbar */}
            <div
              className="flex flex-shrink-0 items-center justify-between border-b px-6 py-3"
              style={{ background: "#ffffff", borderColor: "#e2e8f0" }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: currentConversationId ? "#10b981" : "#94a3b8" }}
                />
                <p className="text-xs font-medium" style={{ color: "#64748b" }}>
                  {currentConversationId ? "Conversation in progress" : "New conversation"}
                </p>
              </div>
              <button
                onClick={() => { setCurrentConversationId(null); setChatMessages([]); }}
                className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-150 hover:-translate-y-0.5"
                style={{
                  borderColor: "#e2e8f0",
                  color: "#6366f1",
                  background: "#ffffff",
                  boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
                }}
              >
                <PlusIcon className="h-3.5 w-3.5" /> New conversation
              </button>
            </div>

            {/* Messages */}
            <div
              className="flex-1 space-y-4 overflow-y-auto p-6"
              style={{ background: "#f1f5f9" }}
            >
              {chatMessages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center pt-16 text-center">
                  <div
                    className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{
                      background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                      boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                    }}
                  >
                    <ChatIcon className="h-8 w-8" style={{ color: "#ffffff" } as React.CSSProperties} />
                  </div>
                  <p className="text-base font-bold" style={{ color: "#0f172a" }}>Start a conversation</p>
                  <p className="mt-1 text-sm" style={{ color: "#64748b" }}>Ask anything based on your uploaded documents</p>
                </div>
              )}

              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className="fade-in flex flex-col"
                  style={{ alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}
                >
                  <div
                    className="max-w-[75%] px-4 py-3 text-sm leading-relaxed"
                    style={
                      msg.role === "user"
                        ? {
                            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                            color: "#ffffff",
                            borderRadius: "18px 18px 4px 18px",
                            boxShadow: "0 2px 8px rgba(99,102,241,0.25)",
                          }
                        : {
                            background: "#ffffff",
                            color: "#0f172a",
                            border: "1px solid #e2e8f0",
                            borderRadius: "18px 18px 18px 4px",
                            boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
                          }
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div
                    className="flex items-center gap-1.5 px-4 py-3"
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "18px 18px 18px 4px",
                      boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
                    }}
                  >
                    <span
                      className="typing-dot inline-block h-2 w-2 rounded-full"
                      style={{ background: "#6366f1", animationDelay: "0ms" }}
                    />
                    <span
                      className="typing-dot inline-block h-2 w-2 rounded-full"
                      style={{ background: "#6366f1", animationDelay: "150ms" }}
                    />
                    <span
                      className="typing-dot inline-block h-2 w-2 rounded-full"
                      style={{ background: "#6366f1", animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input area */}
            <div
              className="flex-shrink-0 border-t p-4"
              style={{ background: "#ffffff", borderColor: "#e2e8f0" }}
            >
              <div className="flex items-end gap-3">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleChatKeyDown}
                  placeholder="Ask a question… (Enter to send, Shift+Enter for new line)"
                  rows={1}
                  disabled={sending}
                  className="flex-1 resize-none px-4 py-3 text-sm transition-all duration-150 disabled:opacity-50"
                  style={{
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    color: "#0f172a",
                    background: "#f8fafc",
                    outline: "none",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !chatInput.trim()}
                  className="flex-shrink-0 px-5 py-3 text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-40"
                  style={{
                    borderRadius: "16px",
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
                    border: "none",
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════ DOCUMENTS TAB ════════ */}
        {activeTab === "documents" && (
          <div className="h-full overflow-y-auto p-6">

            {/* Upload zone */}
            <div
              className="mb-6 rounded-2xl p-6"
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
              }}
            >
              <div className="mb-1 flex items-center gap-2">
                <div
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
                >
                  <FileIcon className="h-4 w-4" style={{ color: "#ffffff" } as React.CSSProperties} />
                </div>
                <h3 className="font-bold" style={{ color: "#0f172a" }}>Upload Document</h3>
              </div>
              <p className="mb-4 text-xs" style={{ color: "#94a3b8" }}>
                Supported: .txt, .md, .pdf, .docx, .xlsx &mdash; max 10 MB
              </p>

              <div className="flex items-center gap-3">
                <label
                  className="flex-1 cursor-pointer rounded-xl border-2 border-dashed px-5 py-4 text-center transition-all duration-150"
                  style={{ borderColor: selectedFile ? "#6366f1" : "#e2e8f0", background: selectedFile ? "#f5f3ff" : "#f8fafc" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLLabelElement).style.borderColor = "#6366f1"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLLabelElement).style.borderColor = selectedFile ? "#6366f1" : "#e2e8f0"; }}
                >
                  <div className="flex flex-col items-center gap-1">
                    {!selectedFile && (
                      <svg viewBox="0 0 24 24" fill="none" className="mb-1 h-6 w-6" style={{ color: "#94a3b8" }}>
                        <path d="M12 15V3m0 0L8.5 6.5M12 3l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M20 16v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    )}
                    <span className="text-sm font-medium" style={{ color: selectedFile ? "#6366f1" : "#64748b" }}>
                      {selectedFile ? selectedFile.name : "Click to select a file (.txt, .md, .pdf, .docx, .xlsx)"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept=".txt,.md,.pdf,.docx,.xlsx"
                    className="hidden"
                    onChange={(e) => {
                      setSelectedFile(e.target.files?.[0] ?? null);
                      setUploadSuccess(null);
                      setUploadError(null);
                    }}
                  />
                </label>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="flex-shrink-0 rounded-xl px-5 py-3 text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
                    border: "none",
                  }}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>

              {uploadSuccess && (
                <div className="mt-3 flex items-center gap-2 rounded-xl px-4 py-2.5" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 flex-shrink-0" style={{ color: "#10b981" }}>
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M6.5 10.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-xs font-medium" style={{ color: "#059669" }}>{uploadSuccess}</p>
                </div>
              )}
              {uploadError && (
                <div className="mt-3 flex items-center gap-2 rounded-xl px-4 py-2.5" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 flex-shrink-0" style={{ color: "#ef4444" }}>
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M10 6v4M10 13.5v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <p className="text-xs font-medium" style={{ color: "#dc2626" }}>{uploadError}</p>
                </div>
              )}
            </div>

            {/* Knowledge base list */}
            <div className="mb-3 flex items-center gap-2">
              <h3 className="font-bold" style={{ color: "#0f172a" }}>Knowledge Base</h3>
              {documents.length > 0 && (
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{ background: "#f5f3ff", color: "#6366f1" }}
                >
                  {documents.length}
                </span>
              )}
            </div>

            {docsLoading ? (
              <div className="flex items-center gap-2 py-4">
                <div className="h-4 w-4 animate-spin rounded-full" style={{ border: "2px solid #e2e8f0", borderTopColor: "#6366f1" }} />
                <p className="text-sm" style={{ color: "#64748b" }}>Loading documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div
                className="rounded-2xl p-12 text-center"
                style={{ border: "2px dashed #e2e8f0", background: "#f8fafc" }}
              >
                <div
                  className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: "#f1f5f9" }}
                >
                  <FileIcon className="h-7 w-7" style={{ color: "#94a3b8" } as React.CSSProperties} />
                </div>
                <p className="font-semibold" style={{ color: "#0f172a" }}>No documents yet</p>
                <p className="mt-1 text-sm" style={{ color: "#94a3b8" }}>Upload a file above to build this bot&apos;s knowledge</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-2xl px-4 py-3.5 transition-all duration-150"
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 1px 3px rgba(15,23,42,0.05)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ background: "#f5f3ff" }}
                      >
                        <FileIcon className="h-5 w-5" style={{ color: "#6366f1" } as React.CSSProperties} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "#0f172a" }}>{doc.filename}</p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span
                            className="rounded-full px-2 py-0.5 text-xs font-semibold"
                            style={{ background: "#f5f3ff", color: "#6366f1" }}
                          >
                            {doc.chunk_count} chunks
                          </span>
                          <span className="text-xs" style={{ color: "#94a3b8" }}>
                            {new Date(doc.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteDoc(doc.filename)}
                      className="rounded-xl p-2 transition-all duration-150"
                      style={{ color: "#94a3b8" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "#fef2f2";
                        (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                        (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
                      }}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════ CONVERSATIONS (LOGS) TAB ════════ */}
        {activeTab === "conversations" && (
          <div className="flex h-full">
            {/* Sidebar */}
            <div
              className="w-72 flex-shrink-0 overflow-y-auto p-4"
              style={{ background: "#ffffff", borderRight: "1px solid #e2e8f0" }}
            >
              <h3 className="mb-3 font-bold" style={{ color: "#0f172a" }}>Conversations</h3>
              {convsLoading ? (
                <div className="flex items-center gap-2 py-4">
                  <div className="h-4 w-4 animate-spin rounded-full" style={{ border: "2px solid #e2e8f0", borderTopColor: "#6366f1" }} />
                  <p className="text-sm" style={{ color: "#64748b" }}>Loading...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="py-8 text-center">
                  <div
                    className="mx-auto mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: "#f1f5f9" }}
                  >
                    <LogsIcon className="h-5 w-5" style={{ color: "#94a3b8" } as React.CSSProperties} />
                  </div>
                  <p className="text-sm" style={{ color: "#94a3b8" }}>No conversations yet.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConv(conv.id)}
                      className="group flex cursor-pointer items-start justify-between rounded-xl px-3 py-2.5 transition-all duration-150"
                      style={
                        selectedConv?.id === conv.id
                          ? { background: "#f5f3ff", border: "1px solid #c7d2fe" }
                          : { background: "transparent", border: "1px solid transparent" }
                      }
                      onMouseEnter={(e) => {
                        if (selectedConv?.id !== conv.id) {
                          (e.currentTarget as HTMLDivElement).style.background = "#f8fafc";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedConv?.id !== conv.id) {
                          (e.currentTarget as HTMLDivElement).style.background = "transparent";
                        }
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className="truncate text-sm font-semibold"
                          style={{ color: selectedConv?.id === conv.id ? "#6366f1" : "#0f172a" }}
                        >
                          {conv.title}
                        </p>
                        <p className="mt-0.5 text-xs" style={{ color: "#94a3b8" }}>
                          {new Date(conv.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteConv(conv.id, e)}
                        className="ml-2 flex-shrink-0 rounded-lg p-1 opacity-0 transition-all duration-150 group-hover:opacity-100"
                        style={{ color: "#94a3b8" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
                          (e.currentTarget as HTMLButtonElement).style.background = "#fef2f2";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
                          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                        }}
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Detail panel */}
            <div className="flex-1 overflow-y-auto p-6" style={{ background: "#f1f5f9" }}>
              {convLoading ? (
                <div className="flex h-full items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full" style={{ border: "2px solid #e2e8f0", borderTopColor: "#6366f1" }} />
                  <p className="text-sm" style={{ color: "#64748b" }}>Loading messages...</p>
                </div>
              ) : selectedConv ? (
                <div>
                  <h3 className="mb-5 font-bold" style={{ color: "#0f172a" }}>{selectedConv.title}</h3>
                  <div className="space-y-3">
                    {selectedConv.messages.map((msg) => (
                      <div key={msg.id} className="flex" style={{ justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                        <div
                          className="max-w-[75%] px-4 py-3 text-sm leading-relaxed"
                          style={
                            msg.role === "user"
                              ? {
                                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                                  color: "#ffffff",
                                  borderRadius: "18px 18px 4px 18px",
                                  boxShadow: "0 2px 8px rgba(99,102,241,0.2)",
                                }
                              : {
                                  background: "#ffffff",
                                  color: "#0f172a",
                                  border: "1px solid #e2e8f0",
                                  borderRadius: "18px 18px 18px 4px",
                                  boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
                                }
                          }
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center pt-16 text-center">
                  <div
                    className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{ background: "#f1f5f9", border: "1px solid #e2e8f0" }}
                  >
                    <LogsIcon className="h-8 w-8" style={{ color: "#94a3b8" } as React.CSSProperties} />
                  </div>
                  <p className="font-bold" style={{ color: "#0f172a" }}>Select a conversation</p>
                  <p className="mt-1 text-sm" style={{ color: "#64748b" }}>Click any conversation on the left to view messages</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════ ANALYTICS TAB ════════ */}
        {activeTab === "analytics" && (
          <div className="h-full overflow-y-auto p-6">
            {analyticsLoading ? (
              <div className="flex items-center gap-2 py-4">
                <div className="h-5 w-5 animate-spin rounded-full" style={{ border: "2px solid #e2e8f0", borderTopColor: "#6366f1" }} />
                <p className="text-sm" style={{ color: "#64748b" }}>Loading analytics...</p>
              </div>
            ) : analytics ? (
              <div className="max-w-2xl space-y-5">

                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className="rounded-2xl p-6"
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
                    }}
                  >
                    <div
                      className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ background: "#f5f3ff" }}
                    >
                      <LogsIcon className="h-5 w-5" style={{ color: "#6366f1" } as React.CSSProperties} />
                    </div>
                    <p className="text-4xl font-black" style={{ color: "#0f172a" }}>
                      {analytics.total_conversations}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide" style={{ color: "#94a3b8" }}>
                      Total Conversations
                    </p>
                  </div>
                  <div
                    className="rounded-2xl p-6"
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
                    }}
                  >
                    <div
                      className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ background: "#f5f3ff" }}
                    >
                      <ChatIcon className="h-5 w-5" style={{ color: "#6366f1" } as React.CSSProperties} />
                    </div>
                    <p className="text-4xl font-black" style={{ color: "#0f172a" }}>
                      {analytics.total_questions}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide" style={{ color: "#94a3b8" }}>
                      Total Questions
                    </p>
                  </div>
                </div>

                {/* Bar chart */}
                <div
                  className="rounded-2xl p-6"
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
                  }}
                >
                  <h3 className="mb-5 font-bold" style={{ color: "#0f172a" }}>Questions — Last 7 Days</h3>
                  {analytics.daily.length === 0 ? (
                    <p className="text-sm" style={{ color: "#94a3b8" }}>No activity in the last 7 days.</p>
                  ) : (
                    <div className="space-y-3">
                      {(() => {
                        const max = Math.max(...analytics.daily.map((d) => d.questions), 1);
                        return analytics.daily.map((d) => (
                          <div key={d.date} className="flex items-center gap-3">
                            <span
                              className="w-24 text-right text-xs font-medium"
                              style={{ color: "#64748b" }}
                            >
                              {d.date}
                            </span>
                            <div
                              className="flex-1 overflow-hidden rounded-full"
                              style={{ height: 10, background: "#f1f5f9" }}
                            >
                              <div
                                className="h-full rounded-full transition-all duration-150"
                                style={{
                                  width: `${(d.questions / max) * 100}%`,
                                  background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
                                }}
                              />
                            </div>
                            <span
                              className="w-6 text-right text-xs font-bold"
                              style={{ color: "#0f172a" }}
                            >
                              {d.questions}
                            </span>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 py-4">
                <p className="text-sm font-medium" style={{ color: "#ef4444" }}>Failed to load analytics.</p>
              </div>
            )}
          </div>
        )}

        {/* ════════ CUSTOMIZE TAB ════════ */}
        {activeTab === "customize" && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-lg space-y-5">

              {/* Appearance form */}
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
                }}
              >
                <h3 className="mb-5 font-bold" style={{ color: "#0f172a" }}>Widget Appearance</h3>

                <div className="space-y-5">
                  {/* Display name */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold" style={{ color: "#0f172a" }}>
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="AI Assistant"
                      className="w-full px-3 py-2.5 text-sm transition-all duration-150"
                      style={{
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        color: "#0f172a",
                        outline: "none",
                        background: "#f8fafc",
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                    <p className="mt-1.5 text-xs" style={{ color: "#94a3b8" }}>Shown in the widget header</p>
                  </div>

                  {/* Welcome message */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold" style={{ color: "#0f172a" }}>
                      Welcome Message
                    </label>
                    <input
                      type="text"
                      value={welcomeMessage}
                      onChange={(e) => setWelcomeMessage(e.target.value)}
                      placeholder="Hi! How can I help you?"
                      className="w-full px-3 py-2.5 text-sm transition-all duration-150"
                      style={{
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        color: "#0f172a",
                        outline: "none",
                        background: "#f8fafc",
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                    <p className="mt-1.5 text-xs" style={{ color: "#94a3b8" }}>Shown before the first message</p>
                  </div>

                  {/* Lead capture toggle */}
                  <div
                    className="flex items-center justify-between rounded-xl px-4 py-3.5"
                    style={{ border: "1px solid #e2e8f0", background: "#f8fafc" }}
                  >
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#0f172a" }}>Lead Capture</p>
                      <p className="mt-0.5 text-xs" style={{ color: "#94a3b8" }}>Ask for name &amp; email before chatting</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLeadCaptureEnabled((v) => !v)}
                      className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-all duration-150"
                      style={{
                        background: leadCaptureEnabled
                          ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                          : "#e2e8f0",
                        boxShadow: leadCaptureEnabled ? "0 1px 4px rgba(99,102,241,0.3)" : "none",
                      }}
                    >
                      <span
                        className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-150"
                        style={{ transform: leadCaptureEnabled ? "translateX(24px)" : "translateX(4px)" }}
                      />
                    </button>
                  </div>

                  {/* Widget color */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold" style={{ color: "#0f172a" }}>
                      Widget Color
                    </label>
                    <div
                      className="flex items-center gap-3 rounded-xl px-4 py-3"
                      style={{ border: "1px solid #e2e8f0", background: "#f8fafc" }}
                    >
                      <input
                        type="color"
                        value={widgetColor}
                        onChange={(e) => setWidgetColor(e.target.value)}
                        className="h-9 w-14 cursor-pointer rounded-lg border-0 p-0.5"
                        style={{ background: "transparent" }}
                      />
                      <span className="font-mono text-sm font-medium" style={{ color: "#0f172a" }}>
                        {widgetColor}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs" style={{ color: "#94a3b8" }}>Header background and user message color</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={handleSaveCustomization}
                    disabled={saving}
                    className="rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                      boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
                      border: "none",
                    }}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>

                  {saveSuccess && (
                    <div className="flex items-center gap-1.5">
                      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" style={{ color: "#10b981" }}>
                        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
                        <path d="M6.5 10.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="text-xs font-medium" style={{ color: "#10b981" }}>Changes saved successfully.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Live preview */}
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
                }}
              >
                <h3 className="mb-4 font-bold" style={{ color: "#0f172a" }}>Preview</h3>
                <div
                  className="overflow-hidden rounded-2xl"
                  style={{ maxWidth: 320, border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(15,23,42,0.08)" }}
                >
                  <div
                    className="flex items-center gap-2.5 px-4 py-3"
                    style={{ background: widgetColor }}
                  >
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full"
                      style={{ background: "rgba(255,255,255,0.2)" }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                        <rect x="5" y="7" width="14" height="11" rx="3" stroke="white" strokeWidth="1.6" />
                        <path d="M12 4v3" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                        <circle cx="9.5" cy="12.5" r="1" fill="white" />
                        <circle cx="14.5" cy="12.5" r="1" fill="white" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-white">{displayName || "AI Assistant"}</p>
                  </div>
                  <div className="p-4" style={{ background: "#f8fafc" }}>
                    <p
                      className="text-center text-xs"
                      style={{ color: "#64748b" }}
                    >
                      {welcomeMessage || "Hi! How can I help you?"}
                    </p>
                    <div className="mt-3 flex justify-end">
                      <span
                        className="rounded-2xl px-3 py-1.5 text-xs font-medium text-white"
                        style={{ background: widgetColor }}
                      >
                        Sample question
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════ LEADS TAB ════════ */}
        {activeTab === "leads" && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-2xl">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h3 className="font-bold" style={{ color: "#0f172a" }}>Captured Leads</h3>
                  <p className="mt-0.5 text-xs" style={{ color: "#94a3b8" }}>Visitors who submitted their info before chatting</p>
                </div>
                {!bot.lead_capture_enabled && (
                  <button
                    onClick={() => setActiveTab("customize")}
                    className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-150 hover:-translate-y-0.5"
                    style={{
                      borderColor: "#e2e8f0",
                      color: "#6366f1",
                      background: "#ffffff",
                      boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
                    }}
                  >
                    Enable Lead Capture <ArrowRightIcon className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {leadsLoading ? (
                <div className="flex items-center gap-2 py-4">
                  <div className="h-4 w-4 animate-spin rounded-full" style={{ border: "2px solid #e2e8f0", borderTopColor: "#6366f1" }} />
                  <p className="text-sm" style={{ color: "#64748b" }}>Loading leads...</p>
                </div>
              ) : leads.length === 0 ? (
                <div
                  className="rounded-2xl p-12 text-center"
                  style={{ border: "2px dashed #e2e8f0", background: "#f8fafc" }}
                >
                  <div
                    className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ background: "#f1f5f9" }}
                  >
                    <LeadsIcon className="h-7 w-7" style={{ color: "#94a3b8" } as React.CSSProperties} />
                  </div>
                  <p className="font-semibold" style={{ color: "#0f172a" }}>No leads yet</p>
                  <p className="mt-1 text-sm" style={{ color: "#94a3b8" }}>
                    {bot.lead_capture_enabled
                      ? "Leads will appear here once visitors submit their info"
                      : "Enable lead capture in the Customize tab to start collecting visitor info"}
                  </p>
                </div>
              ) : (
                <div
                  className="overflow-hidden rounded-2xl"
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
                  }}
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#64748b" }}>Name</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#64748b" }}>Email</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#64748b" }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead, i) => (
                        <tr
                          key={lead.id}
                          style={{
                            borderBottom: i < leads.length - 1 ? "1px solid #e2e8f0" : "none",
                            background: i % 2 === 1 ? "#f8fafc" : "#ffffff",
                          }}
                        >
                          <td className="px-5 py-3.5 font-medium" style={{ color: "#0f172a" }}>
                            {lead.name ?? <span style={{ color: "#94a3b8" }}>—</span>}
                          </td>
                          <td className="px-5 py-3.5" style={{ color: "#0f172a" }}>{lead.email}</td>
                          <td className="px-5 py-3.5 text-xs" style={{ color: "#64748b" }}>
                            {new Date(lead.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="border-t px-5 py-3" style={{ borderColor: "#e2e8f0" }}>
                    <p className="text-xs font-medium" style={{ color: "#94a3b8" }}>
                      {leads.length} lead{leads.length !== 1 ? "s" : ""} total
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════ EMBED TAB ════════ */}
        {activeTab === "embed" && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-2xl">
              <div className="mb-6">
                <h3 className="font-bold" style={{ color: "#0f172a" }}>Embed Your Bot</h3>
                <p className="mt-1 text-sm" style={{ color: "#64748b" }}>Paste one of the snippets below into your HTML.</p>
              </div>

              {/* Floating widget snippet */}
              <div
                className="mb-4 rounded-2xl p-6"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
                }}
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{ background: "#f0fdf4", color: "#10b981" }}
                      >
                        Recommended
                      </span>
                      <h4 className="font-semibold" style={{ color: "#0f172a" }}>Floating Widget</h4>
                    </div>
                    <p className="mt-1 text-xs" style={{ color: "#94a3b8" }}>Adds a floating chat button to any page</p>
                  </div>
                  <button
                    onClick={() => copy(scriptCode, setScriptCopied)}
                    className="flex-shrink-0 rounded-xl border px-4 py-2 text-xs font-semibold transition-all duration-150 hover:-translate-y-0.5"
                    style={{
                      borderColor: scriptCopied ? "#10b981" : "#e2e8f0",
                      color: scriptCopied ? "#10b981" : "#6366f1",
                      background: scriptCopied ? "#f0fdf4" : "#f8fafc",
                    }}
                  >
                    {scriptCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre
                  className="overflow-x-auto rounded-xl p-4 text-xs"
                  style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#0f172a", lineHeight: 1.7 }}
                >
                  {scriptCode}
                </pre>
              </div>

              {/* Inline iframe snippet */}
              <div
                className="mb-5 rounded-2xl p-6"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
                }}
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold" style={{ color: "#0f172a" }}>Inline iframe</h4>
                    <p className="mt-1 text-xs" style={{ color: "#94a3b8" }}>Embed the chat directly in your page layout</p>
                  </div>
                  <button
                    onClick={() => copy(iframeCode, setIframeCopied)}
                    className="flex-shrink-0 rounded-xl border px-4 py-2 text-xs font-semibold transition-all duration-150 hover:-translate-y-0.5"
                    style={{
                      borderColor: iframeCopied ? "#10b981" : "#e2e8f0",
                      color: iframeCopied ? "#10b981" : "#6366f1",
                      background: iframeCopied ? "#f0fdf4" : "#f8fafc",
                    }}
                  >
                    {iframeCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre
                  className="overflow-x-auto rounded-xl p-4 text-xs"
                  style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#0f172a", lineHeight: 1.7 }}
                >
                  {iframeCode}
                </pre>
              </div>

              {/* Preview link */}
              <a
                href={widgetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-150 hover:-translate-y-0.5"
                style={{
                  borderColor: "#e2e8f0",
                  color: "#6366f1",
                  background: "#ffffff",
                  boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
                  textDecoration: "none",
                }}
              >
                <EyeIcon /> Preview widget in new tab <ArrowRightIcon />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Typing animation + fade-in styles */}
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        .typing-dot {
          animation: typingBounce 1.2s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          animation: fadeIn 0.2s ease-out both;
        }
      `}</style>
    </div>
  );
}

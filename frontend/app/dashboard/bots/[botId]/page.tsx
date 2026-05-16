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
} from "@/app/lib/api";
import type {
  Bot,
  BotAnalytics,
  DocumentFile,
  LocalMessage,
  Conversation,
  ConversationDetail,
} from "@/app/types";

type Tab = "chat" | "documents" | "conversations" | "analytics" | "customize" | "embed";

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

  // ── Customize state ─────────────────────────────────────────────────────────
  const [displayName, setDisplayName] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [widgetColor, setWidgetColor] = useState("#0A4F8F");
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
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-[#1D7FC4]">Loading bot...</p>
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
    { key: "embed", label: "Embed", icon: <EmbedIcon className="h-4 w-4" /> },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="border-b border-[#BAE6FD] bg-white px-8 py-4">
        <div className="mb-3 flex items-center gap-2">
          <button
            onClick={() => router.push("/dashboard/bots")}
            className="inline-flex items-center gap-1 text-sm text-[#1D7FC4] transition-colors hover:text-[#0A4F8F]"
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
              <path d="M15.5 10h-10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M9 6.5 5.5 10 9 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Bots
          </button>
          <span className="text-[#BAE6FD]">/</span>
          <span className="font-bold text-[#0A4F8F]">{bot.name}</span>
        </div>
        {bot.description && <p className="mb-3 text-xs text-[#1D7FC4]">{bot.description}</p>}
        <div className="flex flex-wrap gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
                activeTab === tab.key ? "bg-[#0A4F8F] text-white" : "text-[#1D7FC4] hover:bg-[#F0F9FF]"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="min-h-0 flex-1">

        {/* ════════ CHAT TAB ════════ */}
        {activeTab === "chat" && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-[#BAE6FD] bg-white px-6 py-2">
              <p className="text-xs text-[#1D7FC4]">
                {currentConversationId ? "Conversation in progress" : "New conversation"}
              </p>
              <button
                onClick={() => { setCurrentConversationId(null); setChatMessages([]); }}
                className="inline-flex items-center gap-1 rounded-lg border border-[#BAE6FD] px-3 py-1 text-xs font-semibold text-[#0A4F8F] transition-colors hover:bg-[#F0F9FF]"
              >
                <PlusIcon className="h-3.5 w-3.5" /> New conversation
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 p-6">
              {chatMessages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center pt-16 text-center">
                  <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0F9FF] text-[#0A4F8F]">
                    <ChatIcon className="h-7 w-7" />
                  </div>
                  <p className="font-bold text-[#0A4F8F]">Start a conversation</p>
                  <p className="mt-1 text-sm text-[#1D7FC4]">Ask anything based on your uploaded documents</p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#0A4F8F] text-white"
                        : "border border-[#BAE6FD] bg-white text-[#0A4F8F]"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1 max-w-[75%]">
                      {msg.sources.map((src) => (
                        <span key={src} className="rounded-full border border-[#BAE6FD] bg-[#F0F9FF] px-2 py-0.5 text-xs text-[#1D7FC4]">
                          {src}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-[#BAE6FD] bg-white px-4 py-3 text-sm text-[#1D7FC4]">
                    <span className="animate-pulse">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="border-t border-[#BAE6FD] bg-white p-4">
              <div className="flex gap-2">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleChatKeyDown}
                  placeholder="Ask a question… (Enter to send, Shift+Enter for new line)"
                  rows={1}
                  disabled={sending}
                  className="flex-1 resize-none rounded-xl border border-[#BAE6FD] px-4 py-2.5 text-sm text-[#0A4F8F] focus:border-[#1D7FC4] focus:outline-none disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !chatInput.trim()}
                  className="rounded-xl bg-[#0A4F8F] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1D7FC4] disabled:opacity-40"
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
            <div className="mb-6 rounded-xl border border-[#BAE6FD] bg-white p-5 shadow-sm">
              <h3 className="mb-1 font-bold text-[#0A4F8F]">Upload Document</h3>
              <p className="mb-3 text-xs text-[#1D7FC4]">
                Supported: .txt, .md, .pdf, .docx, .xlsx &mdash; max 10 MB.
              </p>
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer rounded-lg border border-dashed border-[#BAE6FD] px-4 py-3 text-center transition-colors hover:border-[#1D7FC4]">
                  <span className="text-sm text-[#1D7FC4]">
                    {selectedFile ? (
                      <span className="font-semibold text-[#0A4F8F]">{selectedFile.name}</span>
                    ) : (
                      "Click to select a file (.txt, .md, .pdf, .docx, .xlsx)"
                    )}
                  </span>
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
                  className="rounded-lg bg-[#0A4F8F] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1D7FC4] disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
              {uploadSuccess && <p className="mt-2 text-xs text-green-600">{uploadSuccess}</p>}
              {uploadError && <p className="mt-2 text-xs text-red-600">{uploadError}</p>}
            </div>

            <h3 className="mb-3 font-bold text-[#0A4F8F]">Knowledge Base</h3>
            {docsLoading ? (
              <p className="text-sm text-[#1D7FC4]">Loading...</p>
            ) : documents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#BAE6FD] p-10 text-center">
                <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0F9FF] text-[#0A4F8F]">
                  <FileIcon />
                </div>
                <p className="text-sm font-semibold text-[#0A4F8F]">No documents yet</p>
                <p className="mt-1 text-xs text-[#1D7FC4]">Upload a file above to build this bot&apos;s knowledge</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded-xl border border-[#BAE6FD] bg-white px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="rounded-lg bg-[#F0F9FF] p-2 text-[#0A4F8F]"><FileIcon className="h-4 w-4" /></span>
                      <div>
                        <p className="text-sm font-semibold text-[#0A4F8F]">{doc.filename}</p>
                        <p className="text-xs text-[#1D7FC4]">{doc.chunk_count} chunks · {new Date(doc.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteDoc(doc.filename)} className="rounded-lg p-1.5 text-[#BAE6FD] transition-colors hover:bg-red-50 hover:text-red-500">
                      <TrashIcon />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════ CONVERSATIONS TAB ════════ */}
        {activeTab === "conversations" && (
          <div className="flex h-full">
            <div className="w-72 flex-shrink-0 overflow-y-auto border-r border-[#BAE6FD] bg-white p-4">
              <h3 className="mb-3 font-bold text-[#0A4F8F]">Conversations</h3>
              {convsLoading ? (
                <p className="text-sm text-[#1D7FC4]">Loading...</p>
              ) : conversations.length === 0 ? (
                <p className="text-sm text-[#1D7FC4]">No conversations yet.</p>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConv(conv.id)}
                      className={`group flex cursor-pointer items-start justify-between rounded-lg px-3 py-2.5 transition-colors ${
                        selectedConv?.id === conv.id ? "border border-[#BAE6FD] bg-[#F0F9FF]" : "hover:bg-[#F0F9FF]"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#0A4F8F]">{conv.title}</p>
                        <p className="text-xs text-[#1D7FC4]">{new Date(conv.created_at).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteConv(conv.id, e)}
                        className="ml-2 flex-shrink-0 rounded p-1 text-[#BAE6FD] opacity-0 transition-all hover:text-red-500 group-hover:opacity-100"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {convLoading ? (
                <div className="flex h-full items-center justify-center"><p className="text-sm text-[#1D7FC4]">Loading messages...</p></div>
              ) : selectedConv ? (
                <div>
                  <h3 className="mb-4 font-bold text-[#0A4F8F]">{selectedConv.title}</h3>
                  <div className="space-y-3">
                    {selectedConv.messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user" ? "bg-[#0A4F8F] text-white" : "border border-[#BAE6FD] bg-white text-[#0A4F8F]"}`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center pt-16 text-center">
                  <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0F9FF] text-[#0A4F8F]"><LogsIcon className="h-7 w-7" /></div>
                  <p className="font-bold text-[#0A4F8F]">Select a conversation</p>
                  <p className="mt-1 text-sm text-[#1D7FC4]">Click any conversation on the left to view messages</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════ ANALYTICS TAB ════════ */}
        {activeTab === "analytics" && (
          <div className="h-full overflow-y-auto p-6">
            {analyticsLoading ? (
              <p className="text-sm text-[#1D7FC4]">Loading analytics...</p>
            ) : analytics ? (
              <div className="max-w-2xl space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[#BAE6FD] bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#1D7FC4]">Total Conversations</p>
                    <p className="mt-2 text-4xl font-black text-[#0A4F8F]">{analytics.total_conversations}</p>
                  </div>
                  <div className="rounded-xl border border-[#BAE6FD] bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#1D7FC4]">Total Questions</p>
                    <p className="mt-2 text-4xl font-black text-[#0A4F8F]">{analytics.total_questions}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-[#BAE6FD] bg-white p-5 shadow-sm">
                  <h3 className="mb-4 font-bold text-[#0A4F8F]">Questions — Last 7 Days</h3>
                  {analytics.daily.length === 0 ? (
                    <p className="text-sm text-[#1D7FC4]">No activity in the last 7 days.</p>
                  ) : (
                    <div className="space-y-2">
                      {(() => {
                        const max = Math.max(...analytics.daily.map((d) => d.questions), 1);
                        return analytics.daily.map((d) => (
                          <div key={d.date} className="flex items-center gap-3">
                            <span className="w-24 text-right text-xs text-[#1D7FC4]">{d.date}</span>
                            <div className="flex-1 rounded-full bg-[#F0F9FF]" style={{ height: 10 }}>
                              <div
                                className="rounded-full bg-[#0A4F8F]"
                                style={{ width: `${(d.questions / max) * 100}%`, height: 10 }}
                              />
                            </div>
                            <span className="w-6 text-xs font-bold text-[#0A4F8F]">{d.questions}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-red-500">Failed to load analytics.</p>
            )}
          </div>
        )}

        {/* ════════ CUSTOMIZE TAB ════════ */}
        {activeTab === "customize" && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-lg space-y-5">
              <div className="rounded-xl border border-[#BAE6FD] bg-white p-5 shadow-sm">
                <h3 className="mb-4 font-bold text-[#0A4F8F]">Widget Appearance</h3>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#0A4F8F]">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="AI Assistant"
                      className="w-full rounded-lg border border-[#BAE6FD] px-3 py-2 text-sm text-[#0A4F8F] focus:border-[#1D7FC4] focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-[#1D7FC4]">Shown in the widget header</p>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#0A4F8F]">Welcome Message</label>
                    <input
                      type="text"
                      value={welcomeMessage}
                      onChange={(e) => setWelcomeMessage(e.target.value)}
                      placeholder="Hi! How can I help you?"
                      className="w-full rounded-lg border border-[#BAE6FD] px-3 py-2 text-sm text-[#0A4F8F] focus:border-[#1D7FC4] focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-[#1D7FC4]">Shown before the first message</p>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#0A4F8F]">Widget Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={widgetColor}
                        onChange={(e) => setWidgetColor(e.target.value)}
                        className="h-10 w-16 cursor-pointer rounded-lg border border-[#BAE6FD] p-1"
                      />
                      <span className="font-mono text-sm text-[#0A4F8F]">{widgetColor}</span>
                    </div>
                    <p className="mt-1 text-xs text-[#1D7FC4]">Header background and user message color</p>
                  </div>
                </div>

                <button
                  onClick={handleSaveCustomization}
                  disabled={saving}
                  className="mt-5 rounded-lg bg-[#0A4F8F] px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#1D7FC4] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                {saveSuccess && <p className="mt-2 text-xs text-green-600">Changes saved successfully.</p>}
              </div>

              {/* Live preview */}
              <div className="rounded-xl border border-[#BAE6FD] bg-white p-5 shadow-sm">
                <h3 className="mb-3 font-bold text-[#0A4F8F]">Preview</h3>
                <div className="overflow-hidden rounded-xl border border-[#BAE6FD]" style={{ maxWidth: 320 }}>
                  <div className="flex items-center gap-2 px-3 py-2.5" style={{ background: widgetColor }}>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white">
                      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                        <rect x="5" y="7" width="14" height="11" rx="3" stroke="currentColor" strokeWidth="1.6" />
                        <path d="M12 4v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        <circle cx="9.5" cy="12.5" r="1" fill="currentColor" />
                        <circle cx="14.5" cy="12.5" r="1" fill="currentColor" />
                      </svg>
                    </div>
                    <p className="text-xs font-bold text-white">{displayName || "AI Assistant"}</p>
                  </div>
                  <div className="bg-[#F8FAFF] p-3">
                    <p className="text-center text-xs text-[#0A4F8F]">{welcomeMessage || "Hi! How can I help you?"}</p>
                    <div className="mt-2 flex justify-end">
                      <span className="rounded-2xl px-3 py-1.5 text-xs text-white" style={{ background: widgetColor }}>
                        Sample question
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════ EMBED TAB ════════ */}
        {activeTab === "embed" && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-2xl">
              <h3 className="mb-1 font-bold text-[#0A4F8F]">Embed Your Bot</h3>
              <p className="mb-6 text-sm text-[#1D7FC4]">Paste one of the snippets below into your HTML.</p>

              <div className="mb-5 rounded-xl border border-[#BAE6FD] bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-[#0A4F8F]">Floating Widget</h4>
                    <p className="text-xs text-[#1D7FC4]">Recommended — adds a floating chat button</p>
                  </div>
                  <button onClick={() => copy(scriptCode, setScriptCopied)} className="rounded-lg border border-[#BAE6FD] px-3 py-1.5 text-xs font-semibold text-[#0A4F8F] transition-colors hover:bg-[#F0F9FF]">
                    {scriptCopied ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="overflow-x-auto rounded-lg bg-[#F0F9FF] p-3 text-xs text-[#0A4F8F]">{scriptCode}</pre>
              </div>

              <div className="mb-5 rounded-xl border border-[#BAE6FD] bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-[#0A4F8F]">Inline iframe</h4>
                    <p className="text-xs text-[#1D7FC4]">Embed the chat directly in your page layout</p>
                  </div>
                  <button onClick={() => copy(iframeCode, setIframeCopied)} className="rounded-lg border border-[#BAE6FD] px-3 py-1.5 text-xs font-semibold text-[#0A4F8F] transition-colors hover:bg-[#F0F9FF]">
                    {iframeCopied ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="overflow-x-auto rounded-lg bg-[#F0F9FF] p-3 text-xs text-[#0A4F8F]">{iframeCode}</pre>
              </div>

              <a href={widgetUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] px-4 py-2.5 text-sm font-semibold text-[#0A4F8F] transition-colors hover:border-[#1D7FC4]">
                <EyeIcon /> Preview widget in new tab <ArrowRightIcon />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

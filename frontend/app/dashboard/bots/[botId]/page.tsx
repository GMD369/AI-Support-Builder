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
} from "@/app/lib/api";
import type {
  Bot,
  DocumentFile,
  LocalMessage,
  Conversation,
  ConversationDetail,
} from "@/app/types";

type Tab = "chat" | "documents" | "conversations" | "embed";

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

  // ── Embed state ─────────────────────────────────────────────────────────────
  const [origin, setOrigin] = useState("");
  const [scriptCopied, setScriptCopied] = useState(false);
  const [iframeCopied, setIframeCopied] = useState(false);

  // Load bot on mount
  useEffect(() => {
    const load = async () => {
      try {
        const b = await getBot(botId);
        setBot(b);
      } catch {
        router.replace("/dashboard/bots");
      } finally {
        setLoadingBot(false);
      }
    };
    void load();
    setOrigin(window.location.origin);
  }, [botId, router]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, sending]);

  // Lazy-load tab data
  useEffect(() => {
    if (activeTab === "documents") void loadDocuments();
    if (activeTab === "conversations") void loadConversations();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDocuments = async () => {
    setDocsLoading(true);
    try {
      setDocuments(await listDocuments(botId));
    } catch {
      //
    } finally {
      setDocsLoading(false);
    }
  };

  const loadConversations = async () => {
    setConvsLoading(true);
    try {
      setConversations(await listConversations(botId));
    } catch {
      //
    } finally {
      setConvsLoading(false);
    }
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
      setChatMessages((prev) => [...prev, { role: "assistant", content: result.answer }]);
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  // ── Document handlers ──────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadSuccess(null);
    setUploadError(null);
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
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  // ── Conversation handlers ──────────────────────────────────────────────────

  const handleSelectConv = async (convId: string) => {
    if (selectedConv?.id === convId) return;
    setConvLoading(true);
    setSelectedConv(null);
    try {
      setSelectedConv(await getConversation(convId));
    } catch {
      //
    } finally {
      setConvLoading(false);
    }
  };

  const handleDeleteConv = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this conversation?")) return;
    try {
      await deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (selectedConv?.id === convId) setSelectedConv(null);
    } catch {
      alert("Failed to delete conversation");
    }
  };

  // ── Embed helpers ──────────────────────────────────────────────────────────

  const widgetUrl = `${origin}/widget/${botId}`;
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

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

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: "chat", label: "Chat", icon: "💬" },
    { key: "documents", label: "Documents", icon: "📄" },
    { key: "conversations", label: "Logs", icon: "📋" },
    { key: "embed", label: "Embed", icon: "🔗" },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="border-b border-[#BAE6FD] bg-white px-8 py-4">
        <div className="mb-3 flex items-center gap-2">
          <button
            onClick={() => router.push("/dashboard/bots")}
            className="text-sm text-[#1D7FC4] transition-colors hover:text-[#0A4F8F]"
          >
            ← Bots
          </button>
          <span className="text-[#BAE6FD]">/</span>
          <span className="font-bold text-[#0A4F8F]">{bot.name}</span>
        </div>
        {bot.description && (
          <p className="mb-3 text-xs text-[#1D7FC4]">{bot.description}</p>
        )}
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? "bg-[#0A4F8F] text-white"
                  : "text-[#1D7FC4] hover:bg-[#F0F9FF]"
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
                onClick={() => {
                  setCurrentConversationId(null);
                  setChatMessages([]);
                }}
                className="rounded-lg border border-[#BAE6FD] px-3 py-1 text-xs font-semibold text-[#0A4F8F] transition-colors hover:bg-[#F0F9FF]"
              >
                + New conversation
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 p-6">
              {chatMessages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center pt-16 text-center">
                  <p className="mb-3 text-5xl">💬</p>
                  <p className="font-bold text-[#0A4F8F]">Start a conversation</p>
                  <p className="mt-1 text-sm text-[#1D7FC4]">
                    Ask anything based on your uploaded documents
                  </p>
                  {documents.length === 0 && (
                    <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700">
                      No documents uploaded yet.{" "}
                      <button
                        onClick={() => setActiveTab("documents")}
                        className="font-semibold underline"
                      >
                        Upload one first →
                      </button>
                    </p>
                  )}
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#0A4F8F] text-white"
                        : "border border-[#BAE6FD] bg-white text-[#0A4F8F]"
                    }`}
                  >
                    {msg.content}
                  </div>
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
                Upload .txt files. Content is chunked and indexed for AI retrieval.
              </p>
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer rounded-lg border border-dashed border-[#BAE6FD] px-4 py-3 text-center transition-colors hover:border-[#1D7FC4]">
                  <span className="text-sm text-[#1D7FC4]">
                    {selectedFile ? (
                      <span className="font-semibold text-[#0A4F8F]">{selectedFile.name}</span>
                    ) : (
                      "Click to select a .txt file"
                    )}
                  </span>
                  <input
                    type="file"
                    accept=".txt"
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
              {uploadSuccess && <p className="mt-2 text-xs text-green-600">✓ {uploadSuccess}</p>}
              {uploadError && <p className="mt-2 text-xs text-red-600">{uploadError}</p>}
            </div>

            <h3 className="mb-3 font-bold text-[#0A4F8F]">Knowledge Base</h3>
            {docsLoading ? (
              <p className="text-sm text-[#1D7FC4]">Loading...</p>
            ) : documents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#BAE6FD] p-10 text-center">
                <p className="mb-2 text-3xl">📄</p>
                <p className="text-sm font-semibold text-[#0A4F8F]">No documents yet</p>
                <p className="mt-1 text-xs text-[#1D7FC4]">Upload a .txt file above to build this bot&apos;s knowledge</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded-xl border border-[#BAE6FD] bg-white px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📄</span>
                      <div>
                        <p className="text-sm font-semibold text-[#0A4F8F]">{doc.filename}</p>
                        <p className="text-xs text-[#1D7FC4]">
                          {doc.chunk_count} chunks · {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteDoc(doc.filename)}
                      className="rounded-lg p-1.5 text-[#BAE6FD] transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      🗑
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
                        🗑
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {convLoading ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-[#1D7FC4]">Loading messages...</p>
                </div>
              ) : selectedConv ? (
                <div>
                  <h3 className="mb-4 font-bold text-[#0A4F8F]">{selectedConv.title}</h3>
                  <div className="space-y-3">
                    {selectedConv.messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            msg.role === "user"
                              ? "bg-[#0A4F8F] text-white"
                              : "border border-[#BAE6FD] bg-white text-[#0A4F8F]"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center pt-16 text-center">
                  <p className="mb-3 text-5xl">📋</p>
                  <p className="font-bold text-[#0A4F8F]">Select a conversation</p>
                  <p className="mt-1 text-sm text-[#1D7FC4]">Click any conversation on the left to view messages</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════ EMBED TAB ════════ */}
        {activeTab === "embed" && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-2xl">
              <h3 className="mb-1 font-bold text-[#0A4F8F]">Embed Your Bot</h3>
              <p className="mb-6 text-sm text-[#1D7FC4]">
                Add this widget to any website. Paste one of the snippets below into your HTML.
              </p>

              {/* Floating script */}
              <div className="mb-5 rounded-xl border border-[#BAE6FD] bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-[#0A4F8F]">Floating Widget</h4>
                    <p className="text-xs text-[#1D7FC4]">Recommended — adds a floating chat button to your site</p>
                  </div>
                  <button
                    onClick={() => copy(scriptCode, setScriptCopied)}
                    className="rounded-lg border border-[#BAE6FD] px-3 py-1.5 text-xs font-semibold text-[#0A4F8F] transition-colors hover:bg-[#F0F9FF]"
                  >
                    {scriptCopied ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
                <pre className="overflow-x-auto rounded-lg bg-[#F0F9FF] p-3 text-xs text-[#0A4F8F]">
                  {scriptCode}
                </pre>
              </div>

              {/* Inline iframe */}
              <div className="mb-5 rounded-xl border border-[#BAE6FD] bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-[#0A4F8F]">Inline iframe</h4>
                    <p className="text-xs text-[#1D7FC4]">Embed the chat directly in your page layout</p>
                  </div>
                  <button
                    onClick={() => copy(iframeCode, setIframeCopied)}
                    className="rounded-lg border border-[#BAE6FD] px-3 py-1.5 text-xs font-semibold text-[#0A4F8F] transition-colors hover:bg-[#F0F9FF]"
                  >
                    {iframeCopied ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
                <pre className="overflow-x-auto rounded-lg bg-[#F0F9FF] p-3 text-xs text-[#0A4F8F]">
                  {iframeCode}
                </pre>
              </div>

              {/* Preview link */}
              <a
                href={widgetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] px-4 py-2.5 text-sm font-semibold text-[#0A4F8F] transition-colors hover:border-[#1D7FC4]"
              >
                👁 Preview widget in new tab →
              </a>

              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-semibold text-amber-800">Before going live</p>
                <p className="mt-1 text-xs text-amber-700">
                  Replace <code className="rounded bg-amber-100 px-1">localhost:8000</code> in your backend URL with your deployed API URL,
                  and update <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_API_BASE_URL</code> in your frontend environment variables.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

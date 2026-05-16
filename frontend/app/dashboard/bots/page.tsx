"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listBots, createBot, deleteBot } from "@/app/lib/api";
import type { Bot } from "@/app/types";

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M10 4.5v11M4.5 10h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BotIcon({ color = "#6366f1" }: { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5" stroke={color} strokeWidth="1.6">
      <rect x="5" y="7" width="14" height="11" rx="3" />
      <path d="M12 4v3" strokeLinecap="round" />
      <circle cx="9.5" cy="12.5" r="1" fill={color} stroke="none" />
      <circle cx="14.5" cy="12.5" r="1" fill={color} stroke="none" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
      <path d="M4 7h16M9.5 4.5h5M8 7l.7 11.2c.05.8.71 1.3 1.5 1.3h3.6c.79 0 1.45-.5 1.5-1.3L16 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const BOT_GRADIENTS = [
  "linear-gradient(135deg,#6366f1,#8b5cf6)",
  "linear-gradient(135deg,#0ea5e9,#6366f1)",
  "linear-gradient(135deg,#10b981,#0ea5e9)",
  "linear-gradient(135deg,#f59e0b,#ef4444)",
  "linear-gradient(135deg,#ec4899,#8b5cf6)",
];

export default function BotsPage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [botName, setBotName] = useState("");
  const [botDesc, setBotDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await listBots();
        if (active) setBots(data);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Failed to load bots");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botName.trim()) return;
    setCreating(true); setCreateError(null);
    try {
      const newBot = await createBot(botName.trim(), botDesc.trim());
      router.push(`/dashboard/bots/${newBot.id}`);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Failed to create bot");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (botId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this bot and all its documents? This cannot be undone.")) return;
    try {
      await deleteBot(botId);
      setBots((prev) => prev.filter((b) => b.id !== botId));
    } catch (e) { alert(e instanceof Error ? e.message : "Failed to delete bot"); }
  };

  const cancelCreate = () => { setShowCreate(false); setBotName(""); setBotDesc(""); setCreateError(null); };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full typing-dot" style={{ background: "#6366f1" }} />
          <div className="h-2 w-2 rounded-full typing-dot" style={{ background: "#6366f1" }} />
          <div className="h-2 w-2 rounded-full typing-dot" style={{ background: "#6366f1" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-extrabold" style={{ color: "#0f172a" }}>My Bots</h2>
          <p className="mt-1 text-sm" style={{ color: "#64748b" }}>Create and manage your AI support bots</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-lg"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
        >
          <PlusIcon /> New Bot
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="mb-6 rounded-2xl p-6 shadow-sm fade-in" style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
          <h3 className="mb-5 text-base font-bold" style={{ color: "#0f172a" }}>Create a new bot</h3>
          <form onSubmit={handleCreate}>
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: "#374151" }}>
                Bot name <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="e.g. Customer Support Bot"
                required autoFocus
                className="w-full rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2"
                style={{ border: "1.5px solid #e2e8f0", color: "#0f172a", focusRingColor: "#6366f1" }}
                onFocus={(e) => { e.target.style.borderColor = "#6366f1"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }}
              />
            </div>
            <div className="mb-5">
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: "#374151" }}>Description</label>
              <input
                value={botDesc}
                onChange={(e) => setBotDesc(e.target.value)}
                placeholder="What does this bot help with? (optional)"
                className="w-full rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none"
                style={{ border: "1.5px solid #e2e8f0", color: "#0f172a" }}
                onFocus={(e) => { e.target.style.borderColor = "#6366f1"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }}
              />
            </div>
            {createError && <p className="mb-4 text-xs" style={{ color: "#ef4444" }}>{createError}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={creating || !botName.trim()} className="rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-opacity disabled:opacity-50" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                {creating ? "Creating…" : "Create Bot"}
              </button>
              <button type="button" onClick={cancelCreate} className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors" style={{ background: "#f1f5f9", color: "#64748b" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {error && <p className="mb-4 text-sm" style={{ color: "#ef4444" }}>{error}</p>}

      {/* Empty state */}
      {bots.length === 0 && !showCreate ? (
        <div className="flex flex-col items-center justify-center rounded-2xl py-20 text-center" style={{ background: "#fff", border: "2px dashed #e2e8f0" }}>
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg,#eef2ff,#f5f3ff)" }}>
            <BotIcon />
          </div>
          <p className="text-base font-bold" style={{ color: "#0f172a" }}>No bots yet</p>
          <p className="mt-1 text-sm" style={{ color: "#64748b" }}>Create your first bot to get started</p>
          <button onClick={() => setShowCreate(true)} className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
            <PlusIcon /> Create your first bot
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot, i) => (
            <div
              key={bot.id}
              onClick={() => router.push(`/dashboard/bots/${bot.id}`)}
              className="group relative cursor-pointer rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: "#fff", border: "1px solid #e2e8f0" }}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: BOT_GRADIENTS[i % BOT_GRADIENTS.length] }}>
                  <BotIcon color="white" />
                </div>
                <button
                  onClick={(e) => handleDelete(bot.id, e)}
                  className="rounded-lg p-1.5 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50"
                  style={{ color: "#94a3b8" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; }}
                >
                  <TrashIcon />
                </button>
              </div>
              <h3 className="font-bold" style={{ color: "#0f172a" }}>{bot.name}</h3>
              {bot.description && (
                <p className="mt-1 text-sm line-clamp-2" style={{ color: "#64748b" }}>{bot.description}</p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs" style={{ color: "#94a3b8" }}>{new Date(bot.created_at).toLocaleDateString()}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold transition-colors group-hover:text-indigo-600" style={{ color: "#6366f1" }}>
                  Open
                  <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listBots, createBot, deleteBot } from "@/app/lib/api";
import type { Bot } from "@/app/types";

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M10 4.5v11M4.5 10h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function BotIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <rect x="5" y="7" width="14" height="11" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 4v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="9.5" cy="12.5" r="1" fill="currentColor" />
      <circle cx="14.5" cy="12.5" r="1" fill="currentColor" />
      <path d="M9 15.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M4.5 10h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M11 6.5L14.5 10 11 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M4 7h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9.5 4.5h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M8 7l.7 11.2c.05.8.71 1.3 1.5 1.3h3.6c.79 0 1.45-.5 1.5-1.3L16 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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

    const loadBots = async () => {
      try {
        const data = await listBots();
        if (!active) return;
        setBots(data);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load bots");
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadBots();

    return () => {
      active = false;
    };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botName.trim()) return;
    setCreating(true);
    setCreateError(null);
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
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete bot");
    }
  };

  const cancelCreate = () => {
    setShowCreate(false);
    setBotName("");
    setBotDesc("");
    setCreateError(null);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-[#1D7FC4]">Loading bots...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#0A4F8F]">My Bots</h2>
          <p className="mt-1 text-sm text-[#1D7FC4]">
            Create and manage your AI support bots
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0A4F8F] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1D7FC4]"
        >
          <PlusIcon />
          Create Bot
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="mb-6 rounded-xl border border-[#BAE6FD] bg-white p-5 shadow-sm"
        >
          <h3 className="mb-4 text-base font-bold text-[#0A4F8F]">New Bot</h3>
          <div className="mb-3">
            <label className="mb-1 block text-xs font-semibold text-[#0A4F8F]">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              placeholder="e.g. Customer Support Bot"
              required
              autoFocus
              className="w-full rounded-lg border border-[#BAE6FD] px-3 py-2 text-sm text-[#0A4F8F] focus:border-[#1D7FC4] focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-xs font-semibold text-[#0A4F8F]">
              Description
            </label>
            <input
              value={botDesc}
              onChange={(e) => setBotDesc(e.target.value)}
              placeholder="Optional — what does this bot help with?"
              className="w-full rounded-lg border border-[#BAE6FD] px-3 py-2 text-sm text-[#0A4F8F] focus:border-[#1D7FC4] focus:outline-none"
            />
          </div>
          {createError && (
            <p className="mb-3 text-xs text-red-600">{createError}</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating || !botName.trim()}
              className="rounded-lg bg-[#0A4F8F] px-4 py-2 text-sm font-bold text-white hover:bg-[#1D7FC4] disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Bot"}
            </button>
            <button
              type="button"
              onClick={cancelCreate}
              className="rounded-lg border border-[#BAE6FD] px-4 py-2 text-sm font-semibold text-[#0A4F8F] hover:bg-[#F0F9FF]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {/* Empty state */}
      {bots.length === 0 && !showCreate ? (
        <div className="rounded-xl border border-dashed border-[#BAE6FD] p-16 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0F9FF] text-[#0A4F8F]">
            <BotIcon />
          </div>
          <p className="text-base font-bold text-[#0A4F8F]">No bots yet</p>
          <p className="mt-1 text-sm text-[#1D7FC4]">
            Create your first bot to get started
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0A4F8F] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1D7FC4]"
          >
            <PlusIcon />
            Create Bot
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => (
            <div
              key={bot.id}
              onClick={() => router.push(`/dashboard/bots/${bot.id}`)}
              className="group relative cursor-pointer rounded-xl border border-[#BAE6FD] bg-white p-5 shadow-sm transition-all hover:border-[#1D7FC4] hover:shadow-md"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0F9FF] text-[#0A4F8F]">
                  <BotIcon />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold text-[#0A4F8F]">{bot.name}</h3>
                  <p className="text-xs text-[#38B2F0]">
                    {new Date(bot.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {bot.description && (
                <p className="line-clamp-2 text-sm text-[#1D7FC4]">
                  {bot.description}
                </p>
              )}
              <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#38B2F0]">
                Open
                <ArrowRightIcon />
              </div>
              <button
                onClick={(e) => handleDelete(bot.id, e)}
                title="Delete bot"
                className="absolute right-3 top-3 rounded-lg p-1.5 text-[#BAE6FD] opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

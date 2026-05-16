"use client";

import { authFetch, getAccessToken } from "./authFetch";
import type {
  Bot,
  BotAnalytics,
  DocumentFile,
  ChatApiResponse,
  Conversation,
  ConversationDetail,
} from "@/app/types";

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
}

// ── Bots ────────────────────────────────────────────────────────────────────

export async function listBots(): Promise<Bot[]> {
  const res = await authFetch("/bots/");
  if (!res.ok) throw new Error("Failed to fetch bots");
  const data = (await res.json()) as { bots: Bot[] };
  return data.bots;
}

export async function createBot(name: string, description: string): Promise<Bot> {
  const res = await authFetch("/bots/", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) {
    const err = (await res.json()) as { detail?: string };
    throw new Error(err.detail ?? "Failed to create bot");
  }
  return res.json() as Promise<Bot>;
}

export async function getBot(botId: string): Promise<Bot> {
  const res = await authFetch(`/bots/${botId}`);
  if (!res.ok) throw new Error("Bot not found");
  return res.json() as Promise<Bot>;
}

export async function updateBot(
  botId: string,
  updates: { display_name?: string; welcome_message?: string; widget_color?: string }
): Promise<Bot> {
  const res = await authFetch(`/bots/${botId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = (await res.json()) as { detail?: string };
    throw new Error(err.detail ?? "Failed to update bot");
  }
  return res.json() as Promise<Bot>;
}

export async function getBotAnalytics(botId: string): Promise<BotAnalytics> {
  const res = await authFetch(`/bots/${botId}/analytics`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json() as Promise<BotAnalytics>;
}

export async function deleteBot(botId: string): Promise<void> {
  const res = await authFetch(`/bots/${botId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete bot");
}

// ── Documents ────────────────────────────────────────────────────────────────

export async function listDocuments(botId?: string): Promise<DocumentFile[]> {
  const url = botId ? `/documents/?bot_id=${encodeURIComponent(botId)}` : "/documents/";
  const res = await authFetch(url);
  if (!res.ok) throw new Error("Failed to fetch documents");
  const data = (await res.json()) as { documents: DocumentFile[] };
  return data.documents;
}

export async function uploadDocument(
  botId: string,
  file: File
): Promise<{ filename: string; chunks_created: number }> {
  const token = await getAccessToken();
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(
    `${apiBase()}/documents/upload?bot_id=${encodeURIComponent(botId)}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }
  );
  if (!res.ok) {
    const err = (await res.json()) as { detail?: string };
    throw new Error(err.detail ?? "Upload failed");
  }
  return res.json() as Promise<{ filename: string; chunks_created: number }>;
}

export async function deleteDocument(filename: string, botId: string): Promise<void> {
  const res = await authFetch(
    `/documents/?filename=${encodeURIComponent(filename)}&bot_id=${encodeURIComponent(botId)}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Failed to delete document");
}

// ── Chat ─────────────────────────────────────────────────────────────────────

export async function sendMessage(
  question: string,
  botId: string,
  conversationId?: string
): Promise<ChatApiResponse> {
  const res = await authFetch("/chat/", {
    method: "POST",
    body: JSON.stringify({
      question,
      bot_id: botId,
      conversation_id: conversationId ?? null,
    }),
  });
  if (!res.ok) {
    const err = (await res.json()) as { detail?: string };
    throw new Error(err.detail ?? "Chat request failed");
  }
  return res.json() as Promise<ChatApiResponse>;
}

// ── Conversations ─────────────────────────────────────────────────────────────

export async function listConversations(botId?: string): Promise<Conversation[]> {
  const url = botId ? `/conversations/?bot_id=${encodeURIComponent(botId)}` : "/conversations/";
  const res = await authFetch(url);
  if (!res.ok) throw new Error("Failed to fetch conversations");
  const data = (await res.json()) as { conversations: Conversation[] };
  return data.conversations;
}

export async function getConversation(conversationId: string): Promise<ConversationDetail> {
  const res = await authFetch(`/conversations/${conversationId}`);
  if (!res.ok) throw new Error("Failed to fetch conversation");
  return res.json() as Promise<ConversationDetail>;
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const res = await authFetch(`/conversations/${conversationId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete conversation");
}

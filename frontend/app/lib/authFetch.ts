"use client";

import { supabase } from "@/app/lib/supabaseClient";

function getApiBaseUrl(): string {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!apiBaseUrl) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_API_BASE_URL");
  }

  return apiBaseUrl;
}

export async function getAccessToken(): Promise<string> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  const token = session?.access_token;

  if (!token) {
    throw new Error("No active session token. Please log in again.");
  }

  return token;
}

export async function authFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getAccessToken();
  const headers = new Headers(init?.headers);

  headers.set("Authorization", `Bearer ${token}`);

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = path.startsWith("http") ? path : `${getApiBaseUrl()}${path}`;

  return fetch(url, {
    ...init,
    headers,
  });
}

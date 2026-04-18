"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { authFetch } from "@/app/lib/authFetch";
import { supabase } from "@/app/lib/supabaseClient";

type CurrentUserResponse = {
  user_id: string;
  email: string | null;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [apiUserEmail, setApiUserEmail] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const loadBackendIdentity = async () => {
      try {
        const response = await authFetch("/auth/me", { method: "GET" });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as CurrentUserResponse;

        if (!isMounted) {
          return;
        }

        setApiUserEmail(payload.email ?? null);
        setApiError(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message = error instanceof Error ? error.message : "Failed to fetch backend user.";
        setApiError(message);
      }
    };

    const loadUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (!currentUser) {
        router.replace("/login");
        return;
      }

      setUser(currentUser);
      void loadBackendIdentity();
      setLoading(false);
    };

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      if (!session?.user) {
        setUser(null);
        router.replace("/login");
        return;
      }

      setUser(session.user);
      void loadBackendIdentity();
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F9FF]">
        <p className="rounded-full border border-[#BAE6FD] bg-white px-4 py-2 text-sm font-semibold text-[#1D7FC4]">
          Checking your session...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F0F9FF] px-6 py-12">
      <section className="mx-auto w-full max-w-4xl rounded-2xl border border-[#BAE6FD] bg-white p-8 shadow-[0_10px_35px_rgba(10,79,143,0.08)]">
        <h1 className="text-3xl font-black text-[#0A4F8F]">Dashboard</h1>
        <p className="mt-3 text-base text-[#1D7FC4]">Welcome {user?.email}</p>

        <div className="mt-6 rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] p-4">
          <p className="text-sm font-semibold text-[#0A4F8F]">Backend verification</p>
          <p className="mt-1 text-sm text-[#1D7FC4]">FastAPI user: {apiUserEmail ?? "Not loaded"}</p>
          {apiError ? <p className="mt-2 text-sm text-[#0A4F8F]">{apiError}</p> : null}
        </div>
      </section>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

function BotIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <rect x="5" y="7" width="14" height="11" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 4v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="9.5" cy="12.5" r="1" fill="currentColor" />
      <circle cx="14.5" cy="12.5" r="1" fill="currentColor" />
    </svg>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!isMounted) return;
      if (!currentUser) {
        router.replace("/login");
        return;
      }
      setUser(currentUser);
      setLoading(false);
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (!session?.user) {
        setUser(null);
        router.replace("/login");
        return;
      }
      setUser(session.user);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F9FF]">
        <p className="rounded-full border border-[#BAE6FD] bg-white px-6 py-3 text-sm font-semibold text-[#1D7FC4]">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F9FF]">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-[#BAE6FD] bg-white">
        <div className="border-b border-[#BAE6FD] px-5 py-5">
          <h1 className="text-sm font-black leading-snug text-[#0A4F8F]">
            AI Support
            <br />
            Builder
          </h1>
        </div>

        <nav className="flex-1 px-3 py-4">
          <Link
            href="/dashboard/bots"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#1D7FC4] transition-colors hover:bg-[#F0F9FF]"
          >
            <BotIcon /> My Bots
          </Link>
        </nav>

        <div className="border-t border-[#BAE6FD] p-4">
          <p
            className="mb-2 truncate text-xs text-[#1D7FC4]"
            title={user?.email ?? ""}
          >
            {user?.email}
          </p>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-[#BAE6FD] bg-[#F0F9FF] px-3 py-1.5 text-xs font-semibold text-[#0A4F8F] transition-colors hover:bg-[#BAE6FD]"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

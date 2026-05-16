"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

function LogoIcon() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="white" strokeWidth="1.8">
        <rect x="5" y="7" width="14" height="11" rx="3" />
        <path d="M12 4v3" strokeLinecap="round" />
        <circle cx="9.5" cy="12.5" r="1" fill="white" stroke="none" />
        <circle cx="14.5" cy="12.5" r="1" fill="white" stroke="none" />
      </svg>
    </div>
  );
}

function BotsIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 flex-shrink-0" stroke={active ? "#a5b4fc" : "#64748b"} strokeWidth="1.7">
      <rect x="5" y="7" width="14" height="11" rx="3" />
      <path d="M12 4v3" strokeLinecap="round" />
      <circle cx="9.5" cy="12.5" r="1" fill={active ? "#a5b4fc" : "#64748b"} stroke="none" />
      <circle cx="14.5" cy="12.5" r="1" fill={active ? "#a5b4fc" : "#64748b"} stroke="none" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.7">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!mounted) return;
      if (!u) { router.replace("/login"); return; }
      setUser(u);
      setLoading(false);
    };
    void init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return;
      if (!session?.user) { setUser(null); router.replace("/login"); return; }
      setUser(session.user);
      setLoading(false);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#0f172a" }}>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full typing-dot" style={{ background: "#6366f1" }} />
          <div className="h-2 w-2 rounded-full typing-dot" style={{ background: "#6366f1" }} />
          <div className="h-2 w-2 rounded-full typing-dot" style={{ background: "#6366f1" }} />
        </div>
      </div>
    );
  }

  const botsActive = pathname.startsWith("/dashboard/bots");
  const avatarLetter = (user?.email?.[0] ?? "U").toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#f1f5f9" }}>
      {/* Sidebar */}
      <aside className="flex w-60 flex-shrink-0 flex-col" style={{ background: "#0f172a", borderRight: "1px solid #1e293b" }}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5" style={{ borderBottom: "1px solid #1e293b" }}>
          <LogoIcon />
          <div>
            <p className="text-sm font-bold leading-none text-white">AI Support</p>
            <p className="text-xs" style={{ color: "#475569" }}>Builder</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#334155" }}>Workspace</p>
          <Link
            href="/dashboard/bots"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all"
            style={{
              background: botsActive ? "#1e293b" : "transparent",
              color: botsActive ? "#e2e8f0" : "#64748b",
              borderLeft: botsActive ? "2px solid #6366f1" : "2px solid transparent",
            }}
          >
            <BotsIcon active={botsActive} />
            My Bots
          </Link>
        </nav>

        {/* User */}
        <div className="p-3" style={{ borderTop: "1px solid #1e293b" }}>
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 mb-1" style={{ background: "#1e293b" }}>
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              {avatarLetter}
            </div>
            <p className="min-w-0 flex-1 truncate text-xs" style={{ color: "#94a3b8" }} title={user?.email ?? ""}>
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors hover:text-white"
            style={{ color: "#475569" }}
          >
            <SignOutIcon />
            Sign out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

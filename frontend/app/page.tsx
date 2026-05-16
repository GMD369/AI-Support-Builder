"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/app/lib/supabaseClient";
import ParticleCanvas from "@/app/components/ParticleCanvas";

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.6">
        <path d="M9 12h6M9 16h6M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Upload Documents",
    desc: "Drop in PDFs, Word docs, spreadsheets, or plain text. Your knowledge base is ready in seconds.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.6">
        <rect x="5" y="7" width="14" height="11" rx="3" />
        <path d="M12 4v3" strokeLinecap="round" />
        <circle cx="9.5" cy="12.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="14.5" cy="12.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
    title: "AI That Understands",
    desc: "Semantic search finds the most relevant context. Groq LLM generates accurate, grounded answers instantly.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.6">
        <path d="M8.5 9 5 12.5 8.5 16M15.5 9 19 12.5 15.5 16M13.5 6.5 10.5 18" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Embed Anywhere",
    desc: "One script tag. Floating chat widget on any website — no dev skills required.",
  },
];

const STATS = [
  { value: "< 2 min", label: "to deploy a bot" },
  { value: "5 formats", label: "document support" },
  { value: "100%", label: "your brand colors" },
];

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      setSession(s);
      setAuthLoading(false);
      if (s) router.replace("/dashboard");
    };
    void loadSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setAuthLoading(false);
      if (s) router.replace("/dashboard");
    });
    return () => subscription.unsubscribe();
  }, [router]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#0f172a" }}>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-indigo-400 typing-dot" />
          <div className="h-2 w-2 rounded-full bg-indigo-400 typing-dot" />
          <div className="h-2 w-2 rounded-full bg-indigo-400 typing-dot" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0f172a", color: "#f8fafc" }}>
      <ParticleCanvas />
      <div className="relative flex min-h-screen flex-col" style={{ zIndex: 1 }}>
      {/* Nav */}
      <header style={{ borderBottom: "1px solid #1e293b" }}>
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="white" strokeWidth="1.8">
                <rect x="5" y="7" width="14" height="11" rx="3" />
                <path d="M12 4v3" strokeLinecap="round" />
                <circle cx="9.5" cy="12.5" r="1" fill="white" stroke="none" />
                <circle cx="14.5" cy="12.5" r="1" fill="white" stroke="none" />
              </svg>
            </div>
            <span className="brand-name text-base">EmbedBot</span>
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <Link href="/dashboard" className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: "#6366f1" }}>
                  Go to Dashboard
                </Link>
                <button onClick={() => supabase.auth.signOut()} className="text-sm font-medium transition-colors hover:text-white" style={{ color: "#94a3b8" }}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold transition-colors hover:text-white" style={{ color: "#94a3b8" }}>
                  Log in
                </Link>
                <Link href="/signup" className="rounded-lg px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold" style={{ background: "#1e293b", color: "#a5b4fc", border: "1px solid #312e81" }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#6366f1" }} />
            Powered by Groq LLM + pgvector RAG
          </div>
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
            Build your AI support bot{" "}
            <span style={{ background: "linear-gradient(135deg,#818cf8,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              in minutes
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed" style={{ color: "#94a3b8" }}>
            Upload your docs, train your bot, and embed a fully-powered AI chatbot on any website — no coding required.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/signup" className="rounded-xl px-8 py-3.5 text-base font-bold text-white transition-opacity hover:opacity-90" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 0 30px rgba(99,102,241,0.35)" }}>
              Start for free →
            </Link>
            <Link href="/login" className="rounded-xl px-8 py-3.5 text-base font-semibold transition-colors hover:border-slate-400" style={{ background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155" }}>
              I have an account
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl py-6" style={{ background: "#1e293b", border: "1px solid #334155" }}>
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="mt-1 text-xs" style={{ color: "#64748b" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{ borderTop: "1px solid #1e293b" }}>
          <div className="mx-auto max-w-5xl px-6 py-20">
            <p className="mb-12 text-center text-xs font-bold uppercase tracking-widest" style={{ color: "#6366f1" }}>How it works</p>
            <div className="grid gap-6 sm:grid-cols-3">
              {FEATURES.map((f, i) => (
                <div key={f.title} className="rounded-2xl p-6 transition-transform hover:-translate-y-0.5" style={{ background: "#1e293b", border: "1px solid #334155" }}>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg,#312e81,#4c1d95)", color: "#a5b4fc" }}>
                    {f.icon}
                  </div>
                  <div className="mb-1 text-xs font-bold" style={{ color: "#6366f1" }}>Step {i + 1}</div>
                  <h3 className="mb-2 font-bold text-white">{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ borderTop: "1px solid #1e293b" }}>
          <div className="mx-auto max-w-2xl px-6 py-20 text-center">
            <h2 className="text-3xl font-extrabold text-white">Ready to automate your support?</h2>
            <p className="mt-3 text-base" style={{ color: "#64748b" }}>No credit card required. Deploy your first bot in under 2 minutes.</p>
            <Link href="/signup" className="mt-8 inline-flex rounded-xl px-8 py-3.5 text-base font-bold text-white transition-opacity hover:opacity-90" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 0 40px rgba(99,102,241,0.3)" }}>
              Get started free →
            </Link>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: "1px solid #1e293b" }}>
        <div className="mx-auto max-w-6xl px-6 py-6 text-center text-xs" style={{ color: "#334155" }}>
          © {new Date().getFullYear()} EmbedBot · All rights reserved.
        </div>
      </footer>
      </div>
    </div>
  );
}

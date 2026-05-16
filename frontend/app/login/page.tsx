"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setErrorMessage(error.message); setLoading(false); return; }
    router.push("/dashboard");
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#0f172a" }}>
      {/* Nav */}
      <header style={{ borderBottom: "1px solid #1e293b" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="white" strokeWidth="1.8">
                <rect x="5" y="7" width="14" height="11" rx="3" />
                <path d="M12 4v3" strokeLinecap="round" />
                <circle cx="9.5" cy="12.5" r="1" fill="white" stroke="none" />
                <circle cx="14.5" cy="12.5" r="1" fill="white" stroke="none" />
              </svg>
            </div>
            <span className="brand-name text-sm">EmbedBot</span>
          </Link>
          <Link href="/signup" className="text-sm font-medium transition-colors hover:text-white" style={{ color: "#64748b" }}>
            Need an account? <span style={{ color: "#6366f1" }}>Sign up →</span>
          </Link>
        </div>
      </header>

      {/* Card */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-white">Welcome back</h1>
            <p className="mt-2 text-sm" style={{ color: "#64748b" }}>Log in to continue to your dashboard</p>
          </div>

          <div className="rounded-2xl p-8" style={{ background: "#1e293b", border: "1px solid #334155" }}>
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-semibold" style={{ color: "#94a3b8" }}>
                  Email address
                </label>
                <input
                  id="email" type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-600"
                  style={{ background: "#0f172a", border: "1.5px solid #334155" }}
                  onFocus={(e) => { e.target.style.borderColor = "#6366f1"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#334155"; }}
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs font-semibold" style={{ color: "#94a3b8" }}>
                  Password
                </label>
                <input
                  id="password" type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-600"
                  style={{ background: "#0f172a", border: "1.5px solid #334155" }}
                  onFocus={(e) => { e.target.style.borderColor = "#6366f1"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#334155"; }}
                />
              </div>

              {errorMessage && (
                <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#450a0a", border: "1px solid #7f1d1d", color: "#fca5a5" }}>
                  {errorMessage}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="btn-gradient w-full rounded-xl py-3 text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Logging in…" : "Log in →"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

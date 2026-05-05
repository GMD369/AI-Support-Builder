"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/app/lib/supabaseClient";

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      setSession(currentSession);
      setAuthLoading(false);

      // Redirect authenticated users straight to the dashboard
      if (currentSession) {
        router.replace("/dashboard");
      }
    };

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, updatedSession) => {
      setSession(updatedSession);
      setAuthLoading(false);
      if (updatedSession) {
        router.replace("/dashboard");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F9FF]">
        <p className="rounded-full border border-[#BAE6FD] bg-white px-6 py-3 text-sm font-semibold text-[#1D7FC4]">
          Checking session...
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#F0F9FF]">
      <div className="pointer-events-none absolute -top-44 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#38B2F0]/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-80 w-80 rounded-full bg-[#1D7FC4]/15 blur-3xl" />

      <header className="relative border-b border-[#BAE6FD] bg-white/90 backdrop-blur">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <p className="text-xl font-bold tracking-tight text-[#0A4F8F]">AI Support Builder</p>
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-full bg-[#0A4F8F] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#1D7FC4]"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="rounded-full border border-[#BAE6FD] bg-white px-5 py-2 text-sm font-semibold text-[#1D7FC4] transition hover:bg-[#F0F9FF]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full border border-[#BAE6FD] bg-white px-5 py-2 text-sm font-semibold text-[#1D7FC4] transition hover:bg-[#F0F9FF]"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-[#0A4F8F] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#1D7FC4]"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <p className="mb-3 rounded-full border border-[#BAE6FD] bg-white px-4 py-1 text-sm font-semibold text-[#1D7FC4]">
          AI-Powered Customer Support
        </p>
        <h1 className="max-w-3xl text-4xl font-black leading-tight text-[#0A4F8F] sm:text-6xl">
          Build Your AI Support Bot in Minutes
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#1D7FC4] sm:text-lg">
          Upload your documents, create a bot, and embed a fully-trained AI chatbot on any website — no coding required.
        </p>

        <div className="mt-10 flex w-full max-w-md flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="rounded-xl bg-[#0A4F8F] px-6 py-3 text-center text-base font-semibold text-white transition hover:bg-[#1D7FC4]"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-[#BAE6FD] bg-white px-6 py-3 text-center text-base font-semibold text-[#1D7FC4] transition hover:border-[#38B2F0] hover:bg-[#F0F9FF]"
          >
            I Have an Account
          </Link>
        </div>

        {/* Feature highlights */}
        <div className="mt-20 grid w-full max-w-4xl gap-6 sm:grid-cols-3">
          {[
            { icon: "📄", title: "Upload Documents", desc: "Drop in your FAQs, manuals, or policy docs as plain text files." },
            { icon: "🤖", title: "Train Your Bot", desc: "Your documents are chunked, embedded, and indexed for AI retrieval instantly." },
            { icon: "🔗", title: "Embed Anywhere", desc: "Copy one script tag and add a floating chat widget to any website." },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-[#BAE6FD] bg-white p-6 text-left shadow-sm"
            >
              <p className="mb-3 text-3xl">{f.icon}</p>
              <h3 className="font-bold text-[#0A4F8F]">{f.title}</h3>
              <p className="mt-1 text-sm text-[#1D7FC4]">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

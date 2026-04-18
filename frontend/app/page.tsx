"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/app/lib/supabaseClient";

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      setSession(currentSession);
      setAuthLoading(false);
    };

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, updatedSession) => {
      setSession(updatedSession);
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#F0F9FF]">
      <div className="pointer-events-none absolute -top-44 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#38B2F0]/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-80 w-80 rounded-full bg-[#1D7FC4]/15 blur-3xl" />

      <header className="relative border-b border-[#BAE6FD] bg-white/90 backdrop-blur">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <p className="text-xl font-bold tracking-tight text-[#0A4F8F]">AI Support Builder</p>
          <div className="flex items-center gap-3">
            {authLoading ? (
              <span className="rounded-full border border-[#BAE6FD] bg-white px-4 py-2 text-sm font-semibold text-[#1D7FC4]">
                Checking session...
              </span>
            ) : session ? (
              <>
                <span className="rounded-full border border-[#BAE6FD] bg-white px-4 py-2 text-sm font-semibold text-[#1D7FC4]">
                  {session.user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="rounded-full bg-[#0A4F8F] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#1D7FC4]"
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
          Supabase Authentication Ready
        </p>
        <h1 className="max-w-3xl text-4xl font-black leading-tight text-[#0A4F8F] sm:text-6xl">
          Secure Login and Signup for Your AI Support Workspace
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#1D7FC4] sm:text-lg">
          Use email and password authentication powered by Supabase. New users can create accounts in seconds, and existing users can sign in with a clean, fast interface.
        </p>

        <div className="mt-10 flex w-full max-w-md flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="rounded-xl bg-[#0A4F8F] px-6 py-3 text-center text-base font-semibold text-white transition hover:bg-[#1D7FC4]"
          >
            Create Account
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-[#BAE6FD] bg-white px-6 py-3 text-center text-base font-semibold text-[#1D7FC4] transition hover:border-[#38B2F0] hover:bg-[#F0F9FF]"
          >
            I Have an Account
          </Link>
        </div>
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { supabase } from "@/app/lib/supabaseClient";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setSuccessMessage("Account created. Check your email for a confirmation link, then log in.");
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#F0F9FF] px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-[#38B2F0]/25 blur-3xl" />

      <header className="relative mx-auto flex w-full max-w-5xl items-center justify-between rounded-2xl border border-[#BAE6FD] bg-white px-5 py-4">
        <Link href="/" className="text-lg font-bold text-[#0A4F8F]">
          AI Support Builder
        </Link>
        <Link href="/login" className="text-sm font-semibold text-[#1D7FC4] hover:text-[#0A4F8F]">
          Already have an account?
        </Link>
      </header>

      <main className="relative mx-auto mt-10 w-full max-w-md rounded-2xl border border-[#BAE6FD] bg-white p-7 shadow-[0_10px_35px_rgba(10,79,143,0.08)] sm:p-8">
        <h1 className="text-3xl font-black tracking-tight text-[#0A4F8F]">Create your account</h1>
        <p className="mt-2 text-sm text-[#1D7FC4]">Start building secure support workflows in minutes.</p>

        <form onSubmit={handleSignUp} className="mt-7 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#0A4F8F]">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] px-4 py-3 text-[#0A4F8F] outline-none transition placeholder:text-[#1D7FC4]/70 focus:border-[#38B2F0] focus:ring-2 focus:ring-[#38B2F0]/25"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#0A4F8F]">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] px-4 py-3 text-[#0A4F8F] outline-none transition placeholder:text-[#1D7FC4]/70 focus:border-[#38B2F0] focus:ring-2 focus:ring-[#38B2F0]/25"
            />
          </div>

          {errorMessage ? (
            <p className="rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] px-4 py-3 text-sm font-medium text-[#0A4F8F]">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] px-4 py-3 text-sm font-medium text-[#1D7FC4]">
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#0A4F8F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1D7FC4] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
      </main>
    </div>
  );
}

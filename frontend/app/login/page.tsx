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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#F0F9FF] px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute right-12 top-10 h-72 w-72 rounded-full bg-[#38B2F0]/25 blur-3xl" />

      <header className="relative mx-auto flex w-full max-w-5xl items-center justify-between rounded-2xl border border-[#BAE6FD] bg-white px-5 py-4">
        <Link href="/" className="text-lg font-bold text-[#0A4F8F]">
          AI Support Builder
        </Link>
        <Link href="/signup" className="text-sm font-semibold text-[#1D7FC4] hover:text-[#0A4F8F]">
          Need an account?
        </Link>
      </header>

      <main className="relative mx-auto mt-10 w-full max-w-md rounded-2xl border border-[#BAE6FD] bg-white p-7 shadow-[0_10px_35px_rgba(10,79,143,0.08)] sm:p-8">
        <h1 className="text-3xl font-black tracking-tight text-[#0A4F8F]">Welcome back</h1>
        <p className="mt-2 text-sm text-[#1D7FC4]">Log in to continue to your support dashboard.</p>

        <form onSubmit={handleLogin} className="mt-7 space-y-5">
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
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] px-4 py-3 text-[#0A4F8F] outline-none transition placeholder:text-[#1D7FC4]/70 focus:border-[#38B2F0] focus:ring-2 focus:ring-[#38B2F0]/25"
            />
          </div>

          {errorMessage ? (
            <p className="rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] px-4 py-3 text-sm font-medium text-[#0A4F8F]">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#0A4F8F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1D7FC4] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </main>
    </div>
  );
}

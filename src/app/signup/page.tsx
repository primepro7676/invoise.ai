"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Lock, Mail, Loader2, ArrowRight, Sparkles } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Failed to create account.");
        setLoading(false);
        return;
      }

      // Auto sign in after registration
      const loginRes = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        router.push("/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Signup error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080b11] p-4 sm:p-6">
      {/* Ambient background glow orbs */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-purple-500/10 blur-[140px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo / Header */}
        <div className="mb-7 text-center">
          <div className="mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/20 via-[#121726] to-black text-2xl font-black text-amber-400 shadow-xl shadow-amber-500/15 backdrop-blur-xl">
            PP
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-xs font-semibold text-amber-300 backdrop-blur-md mb-2">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Admin Registration</span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Create Admin Account
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Register an authorized account to manage invoices, pricing, and clients.
          </p>
        </div>

        {/* Frosted Glass Signup Card */}
        <div className="rounded-3xl border border-white/10 bg-[#0f1422]/75 p-6 sm:p-8 shadow-[0_16px_48px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-white">Register Account</h2>
            <p className="text-xs text-slate-400">
              Fill in your details below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-300 backdrop-blur-md">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-300">
                Full Name
              </label>

              <div className="relative mt-1.5">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                <input
                  id="name"
                  type="text"
                  required
                  placeholder=""
                  className="w-full rounded-xl border border-white/15 bg-black/40 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-300">
                Email Address
              </label>

              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder=""
                  className="w-full rounded-xl border border-white/15 bg-black/40 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-300">
                Password
              </label>

              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder=""
                  className="w-full rounded-xl border border-white/15 bg-black/40 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-sm font-bold text-black shadow-lg shadow-amber-500/25 transition hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-white/10 pt-4 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-amber-400 hover:text-amber-300 hover:underline transition"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-slate-500">
          © 2026 PrimePro Technologies AI LLC & Fuelo Technologies OPC Pvt Ltd.
        </p>
      </div>
    </div>
  );
}

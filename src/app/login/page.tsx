"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f7f4] p-4 sm:p-6">
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-[#0c2e1b]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#e5ba55]/15 blur-[140px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e5ba55]/40 bg-[#0c2e1b] text-2xl font-black text-[#f0c34e] shadow-xl shadow-[#0c2e1b]/20">
            PP
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#0c2e1b]/20 bg-[#0c2e1b]/10 px-3.5 py-1 text-xs font-bold text-[#0c2e1b] mb-2">
            <Sparkles className="h-3.5 w-3.5 text-[#e5ba55]" />
            <span>PrimePro × Fuelo</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0c2317]">
            Tax Invoice & Billing Portal
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm font-medium text-[#526b5c]">
            Sign in to access real-time financial intelligence and billing management.
          </p>
        </div>

        <div className="rounded-3xl border border-[#e1ece3] bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(12,46,27,0.08)]">
          <div className="mb-5 flex items-center justify-between border-b border-[#e1ece3] pb-4">
            <div>
              <h2 className="text-lg font-black text-[#0c2317]">Welcome Back</h2>
              <p className="text-xs font-medium text-[#526b5c] mt-0.5">
                Enter your admin credentials to continue.
              </p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-[#f4f7f4] border border-[#e1ece3] flex items-center justify-center text-[#0c2e1b]">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[#526b5c]">
                Email Address
              </label>

              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8aa393]" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-[#cdddd2] bg-white pl-10 pr-3.5 py-2.5 text-sm font-semibold text-[#0c2317] placeholder-[#8aa393] outline-none transition focus:border-[#0c2e1b] focus:ring-2 focus:ring-[#0c2e1b]/20"
                  placeholder="admin@primepro.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[#526b5c]">
                Password
              </label>

              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8aa393]" />
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-[#cdddd2] bg-white pl-10 pr-3.5 py-2.5 text-sm font-semibold text-[#0c2317] placeholder-[#8aa393] outline-none transition focus:border-[#0c2e1b] focus:ring-2 focus:ring-[#0c2e1b]/20"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0c2e1b] px-4 py-3 text-sm font-black text-[#f0c34e] shadow-lg shadow-[#0c2e1b]/20 transition hover:bg-[#133b24] hover:shadow-[#0c2e1b]/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In to Dashboard <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-5 border-t border-[#e1ece3] pt-4 text-center text-xs font-semibold text-[#526b5c]">
            Need to create an account?{" "}
            <Link
              href="/signup"
              className="font-bold text-[#0c2e1b] hover:text-[#e5ba55] hover:underline transition"
            >
              Sign Up
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs font-medium text-[#526b5c]">
          © 2026 PrimePro Technologies AI LLC & Fuelo Technologies OPC Pvt Ltd.
        </p>
      </div>
    </div>
  );
}

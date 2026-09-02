"use client";

import { signOut } from "next-auth/react";
import { LogOut, Menu, User, Plus } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const mobileNav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/invoices/new", label: "Create Invoice" },
  { href: "/dashboard/invoices", label: "Invoices" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/services", label: "Services" },
  { href: "/dashboard/packages", label: "Packages & Pricing" },
  { href: "/dashboard/terms", label: "Terms & Conditions" },
  { href: "/dashboard/settings", label: "Company Settings" },
];

export function Topbar({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#0a0e18]/80 px-4 py-3.5 backdrop-blur-xl sm:px-6 lg:px-8 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          className="rounded-xl p-2 text-slate-300 hover:bg-white/10 lg:hidden transition"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden text-sm text-slate-400 lg:block">
          Welcome back, <span className="font-semibold text-white">{userName}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/dashboard/invoices/new">
          <button className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/25 transition">
            <Plus className="h-3.5 w-3.5" />
            <span>New Invoice</span>
          </button>
        </Link>

        {/* User Pill */}
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-300">
            <User className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-medium text-slate-200 hidden sm:inline">{userName}</span>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300 transition"
          title="Sign Out"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="absolute left-0 top-full z-30 w-full border-b border-white/10 bg-[#0d121f]/95 p-4 shadow-2xl backdrop-blur-2xl lg:hidden">
          <nav className="space-y-1">
            {mobileNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

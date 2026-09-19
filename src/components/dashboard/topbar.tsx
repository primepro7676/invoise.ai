"use client";

import { signOut } from "next-auth/react";
import { LogOut, Menu, User, Plus } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

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
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await signOut({ redirect: false });
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#e2ebe4] bg-white px-4 py-3.5 sm:px-6 lg:px-8 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          className="rounded-xl p-2 text-[#355240] hover:bg-[#eef5f0] lg:hidden transition"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden text-sm text-[#526b5c] lg:block">
          Welcome back, <span className="font-semibold text-[#0c2317]">{userName || "Admin"}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/dashboard/invoices/new">
          <button className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#0c2e1b] px-4 py-1.5 text-xs font-bold text-[#f0c34e] hover:bg-[#133b24] transition shadow-xs">
            <Plus className="h-3.5 w-3.5 text-[#f0c34e]" />
            <span>New Invoice</span>
          </button>
        </Link>

        <div className="flex items-center gap-2 rounded-full border border-[#d8e5dc] bg-white px-3 py-1.5 shadow-xs">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0c2e1b] text-xs font-bold text-[#f0c34e]">
            <User className="h-3 w-3" />
          </div>
          <span className="text-xs font-bold text-[#0c2317] hidden sm:inline">{userName || "Admin"}</span>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-1.5 rounded-full border border-[#d8e5dc] bg-white px-3.5 py-1.5 text-xs font-bold text-[#0c2317] hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition shadow-xs disabled:opacity-50"
          title="Sign Out"
        >
          <LogOut className="h-3.5 w-3.5 text-[#526b5c]" />
          <span className="hidden sm:inline">{loggingOut ? "Signing out..." : "Logout"}</span>
        </button>
      </div>

      {open && (
        <div className="absolute left-0 top-full z-30 w-full border-b border-[#e2ebe4] bg-white p-4 shadow-xl lg:hidden">
          <nav className="space-y-1">
            {mobileNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#1c3d2b] hover:bg-[#eef5f0] hover:text-[#0c2e1b]"
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

"use client";

import { signOut } from "next-auth/react";
import { LogOut, Menu } from "lucide-react";
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
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-brand-100 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <button
        className="rounded-lg p-2 text-navy-700 hover:bg-brand-50 lg:hidden"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="hidden text-sm text-navy-600/70 lg:block">
        Welcome back, <span className="font-medium text-navy-900">{userName}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm font-medium text-navy-900 sm:inline">{userName}</span>
        <Button variant="secondary" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="h-3.5 w-3.5" />
          Logout
        </Button>
      </div>

      {open && (
        <div className="absolute left-0 top-full z-30 w-full border-b border-brand-100 bg-white p-3 shadow-card lg:hidden">
          {mobileNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-navy-700 hover:bg-brand-50"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

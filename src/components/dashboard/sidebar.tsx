"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FilePlus2,
  FileText,
  Users,
  Wrench,
  Layers,
  ScrollText,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/invoices/new", label: "Create Invoice", icon: FilePlus2 },
  { href: "/dashboard/invoices", label: "Invoices", icon: FileText },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/services", label: "Services", icon: Wrench },
  { href: "/dashboard/packages", label: "Packages & Pricing", icon: Layers },
  { href: "/dashboard/terms", label: "Terms & Conditions", icon: ScrollText },
  { href: "/dashboard/settings", label: "Company Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-[#0a0e18]/90 shadow-2xl backdrop-blur-2xl lg:flex">
      {/* Brand Header */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/20 via-[#121726] to-black text-sm font-black text-amber-400 shadow-md shadow-amber-500/10">
          PP
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">PrimePro × Fuelo</p>
          <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mt-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Invoice System
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto p-3.5">
        {nav.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition duration-200",
                active
                  ? "border border-amber-500/40 bg-amber-500/15 text-amber-400 font-semibold shadow-inner shadow-amber-500/10"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-amber-400" : "text-slate-400")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="border-t border-white/10 p-4">
        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-[11px] text-slate-400/80 backdrop-blur-sm">
          <p className="font-semibold text-slate-300">USA & India Headquarters</p>
          <p className="mt-0.5 text-slate-500">Delaware, USA · Bengaluru, IND</p>
        </div>
      </div>
    </aside>
  );
}

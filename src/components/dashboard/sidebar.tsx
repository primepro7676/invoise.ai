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
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[#113a23] bg-[#092616] shadow-xl lg:flex">
      <div className="flex items-center gap-3 border-b border-[#113a23] px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c99b2e] text-xs font-black text-[#092616] shadow-md ring-1 ring-[#e5ba55]/40">
          PP
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">PrimePro × Fuelo</p>
          <p className="text-[11px] font-medium text-[#8cb099] flex items-center gap-1.5 mt-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80] animate-pulse" />
            Invoice System
          </p>
        </div>
      </div>

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
                  ? "border border-[#1f5735] bg-[#133b24] text-[#e5ba55] font-semibold shadow-inner"
                  : "text-[#9cb8a7] hover:bg-[#0e331e] hover:text-white"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-[#e5ba55]" : "text-[#9cb8a7]")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#113a23] p-4">
        <div className="flex items-center gap-2.5 rounded-xl border border-[#143e26] bg-[#0c2e1b]/70 p-2.5 text-[11px]">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#071d11] border border-[#1b4e30] text-[11px] font-black text-[#9cb8a7]">
            N
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-[#d1e5d8] truncate">USA & India Headquarters</p>
            <p className="mt-0.5 text-[#759982] truncate">Delaware, USA · Bengaluru, IND</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

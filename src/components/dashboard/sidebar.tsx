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
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-brand-100 bg-white lg:flex">
      <div className="flex items-center gap-3 border-b border-brand-100 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
          PP
        </div>
        <div>
          <p className="text-sm font-semibold text-navy-900 leading-tight">PrimePro × Fuelo</p>
          <p className="text-xs text-navy-600/60">Invoice System</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {nav.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-navy-700 hover:bg-brand-50"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-brand-100 p-4 text-xs text-navy-600/50">
        PrimePro Technologies AI LLC
        <br />
        Fuelo Technologies OPC Pvt Ltd
      </div>
    </aside>
  );
}

import Link from "next/link";
import {
  FileText,
  Users,
  IndianRupee,
  Layers,
  Sparkles,
  TrendingUp,
  CreditCard,
  RotateCw,
  Calendar,
  Package,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatINR, formatDate } from "@/lib/calculations";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [
    invoiceCount,
    customerCount,
    categoryCount,
    packageCount,
    bundleCount,
    recentInvoices,
    allInvoices,
    allCustomers,
  ] = await Promise.all([
    prisma.invoice.count(),
    prisma.customer.count(),
    prisma.serviceCategory.count({ where: { isActive: true } }),
    prisma.package.count({ where: { isActive: true } }),
    prisma.packageBundle.count({ where: { isActive: true } }).catch(() => 0),
    prisma.invoice.findMany({
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.invoice.findMany({
      select: {
        grandTotal: true,
        amountPaid: true,
        balanceDue: true,
        paymentStatus: true,
        paymentMethod: true,
      },
    }),
    prisma.customer.findMany({
      select: { gstin: true },
    }),
  ]);

  // Financial calculations
  const totalCollected = allInvoices.reduce((sum, inv) => sum + (Number(inv.amountPaid) || 0), 0);
  const totalInvoiced = allInvoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);

  // Status counts
  const paidCount = allInvoices.filter((i) => i.paymentStatus === "PAID").length;
  const partiallyPaidCount = allInvoices.filter((i) => i.paymentStatus === "PARTIALLY_PAID").length;
  const unpaidCount = allInvoices.filter((i) => i.paymentStatus === "UNPAID").length;
  const overdueCount = allInvoices.filter((i) => i.paymentStatus === "OVERDUE").length;

  // Customers breakdown
  const gstCustomersCount = allCustomers.filter((c) => Boolean(c.gstin && c.gstin.trim())).length;
  const nonGstCustomersCount = customerCount - gstCustomersCount;

  // Payment methods breakdown
  const upiCollected = allInvoices
    .filter((i) => i.paymentMethod === "UPI")
    .reduce((sum, i) => sum + (Number(i.amountPaid) || 0), 0);
  const bankCollected = allInvoices
    .filter((i) => i.paymentMethod === "Bank Transfer")
    .reduce((sum, i) => sum + (Number(i.amountPaid) || 0), 0);
  const cashOrOtherCollected = allInvoices
    .filter((i) => i.paymentMethod !== "UPI" && i.paymentMethod !== "Bank Transfer")
    .reduce((sum, i) => sum + (Number(i.amountPaid) || 0), 0);

  const upiPercent = totalCollected > 0 ? Math.round((upiCollected / totalCollected) * 100) : 0;
  const bankPercent = totalCollected > 0 ? Math.round((bankCollected / totalCollected) * 100) : 0;
  const otherPercent = Math.max(0, 100 - upiPercent - bankPercent);

  const currentMonthName = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="space-y-4 pb-10">
      {/* Top Header & Filters - Compact & Ultra-Sleek */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Dashboard Analytics
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Live Data
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Dynamic sales intelligence, collected payment reconciliation, and order performance.
          </p>
        </div>

        {/* Time Filter Pills */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-[#0c101c]/80 p-1 shadow-lg backdrop-blur-xl">
          <button
            type="button"
            className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-white transition"
          >
            Today
          </button>
          <button
            type="button"
            className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-white transition"
          >
            This Week
          </button>
          <button
            type="button"
            className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-bold text-black shadow-md shadow-amber-500/25 transition"
          >
            This Month
          </button>
          <button
            type="button"
            className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-white transition"
          >
            Month Wise
          </button>
          <button
            type="button"
            className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-white transition"
          >
            Yearly
          </button>
          <button
            type="button"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-amber-400 hover:bg-amber-500/10 transition"
            title="Refresh metrics"
          >
            <RotateCw className="h-3 w-3" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Viewing Metrics Banner */}
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0d121e]/60 px-3.5 py-2 text-xs font-medium text-slate-300 backdrop-blur-md">
        <Calendar className="h-3.5 w-3.5 text-amber-400" />
        <span>
          Viewing metrics for: <strong className="text-white">This Month ({currentMonthName})</strong>
        </span>
      </div>

      {/* =========================================================
          4 COMPACT, SLEEK METRIC CARDS (ULTRA-PRO REPLICA)
      ========================================================= */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* CARD 1: NET COLLECTED REVENUE */}
        <div className="flex flex-col justify-between rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-[#101422]/90 to-[#090c14]/95 p-4 shadow-lg backdrop-blur-xl transition hover:border-amber-500/50">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                <IndianRupee className="h-3 w-3" /> Net Collected Revenue
              </span>
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                <TrendingUp className="h-3 w-3" />
              </div>
            </div>

            <div className="mt-2.5">
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {formatINR(totalCollected)}
              </h3>
              <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                <span>+100%</span>
                <span className="font-normal text-emerald-400/75">vs previous period</span>
              </div>
            </div>
          </div>

          <div className="mt-3.5 space-y-1 border-t border-white/10 pt-2.5 text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>Online (UPI):</span>
              <span className="font-medium text-slate-200">{formatINR(upiCollected)}</span>
            </div>
            <div className="flex justify-between">
              <span>Bank / Cash:</span>
              <span className="font-medium text-slate-200">{formatINR(bankCollected + cashOrOtherCollected)}</span>
            </div>
            <div className="flex justify-between text-amber-300 font-semibold">
              <span>Gross Invoiced:</span>
              <span>{formatINR(totalInvoiced)}</span>
            </div>
          </div>
        </div>

        {/* CARD 2: INVOICES IN PERIOD */}
        <div className="flex flex-col justify-between rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-[#101422]/90 to-[#090c14]/95 p-4 shadow-lg backdrop-blur-xl transition hover:border-blue-500/50">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-400">
                <FileText className="h-3 w-3" /> Invoices in Period
              </span>
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                <FileText className="h-3 w-3" />
              </div>
            </div>

            <div className="mt-2.5">
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {invoiceCount}
              </h3>
              <p className="mt-1 text-[11px] text-slate-400">
                {paidCount} paid & fulfilled transactions
              </p>
            </div>
          </div>

          <div className="mt-3.5 border-t border-white/10 pt-2.5">
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5">
                <span className="text-emerald-400 font-medium">Paid</span>
                <span className="font-bold text-white">{paidCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-blue-500/10 border border-blue-500/20 px-2 py-0.5">
                <span className="text-blue-400 font-medium">Partial</span>
                <span className="font-bold text-white">{partiallyPaidCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-amber-500/10 border border-amber-500/20 px-2 py-0.5">
                <span className="text-amber-400 font-medium">Pending</span>
                <span className="font-bold text-white">{unpaidCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-red-500/10 border border-red-500/20 px-2 py-0.5">
                <span className="text-red-400 font-medium">Overdue</span>
                <span className="font-bold text-white">{overdueCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: SERVICES & RATES */}
        <div className="flex flex-col justify-between rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-[#101422]/90 to-[#090c14]/95 p-4 shadow-lg backdrop-blur-xl transition hover:border-emerald-500/50">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                <Package className="h-3 w-3" /> Services & Rates
              </span>
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <Layers className="h-3 w-3" />
              </div>
            </div>

            <div className="mt-2.5">
              <div className="flex items-baseline gap-1">
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  {packageCount}
                </h3>
                <span className="text-[11px] text-slate-400">packages</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                across {categoryCount} service domains
              </p>
            </div>
          </div>

          <div className="mt-3.5 space-y-1 border-t border-white/10 pt-2.5 text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>Categories:</span>
              <span className="font-medium text-slate-200">{categoryCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Master Bundles:</span>
              <span className="font-medium text-slate-200">{bundleCount}</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-medium pt-0.5">
              <Link href="/dashboard/packages" className="hover:underline flex items-center gap-0.5">
                Manage Catalog ↗
              </Link>
            </div>
          </div>
        </div>

        {/* CARD 4: CUSTOMER ACCOUNTS */}
        <div className="flex flex-col justify-between rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-[#101422]/90 to-[#090c14]/95 p-4 shadow-lg backdrop-blur-xl transition hover:border-purple-500/50">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-400">
                <Users className="h-3 w-3" /> Customer Accounts
              </span>
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
                <Users className="h-3 w-3" />
              </div>
            </div>

            <div className="mt-2.5">
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {customerCount}
              </h3>
              <p className="mt-1 text-[11px] text-slate-400">
                total registered clients
              </p>
            </div>
          </div>

          <div className="mt-3.5 space-y-1 border-t border-white/10 pt-2.5 text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>GST Registered:</span>
              <span className="font-medium text-slate-200">{gstCustomersCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Standard:</span>
              <span className="font-medium text-slate-200">{nonGstCustomersCount}</span>
            </div>
            <div className="flex justify-between text-purple-400 font-medium pt-0.5">
              <Link href="/dashboard/customers" className="hover:underline flex items-center gap-0.5">
                Manage Customers ↗
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          ANALYTICAL BREAKDOWN WIDGETS
      ========================================================= */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* WIDGET 1: Payment Methods Breakdown */}
        <div className="rounded-2xl border border-white/10 bg-[#0d121e]/80 p-4 shadow-lg backdrop-blur-xl lg:col-span-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
            <CreditCard className="h-3.5 w-3.5 text-amber-400" />
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Payment Breakdown</h3>
              <p className="text-[10px] text-slate-400">Reconciliation by payment gateway vs cash.</p>
            </div>
          </div>

          <div className="mt-3.5 space-y-3">
            {/* UPI */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Razorpay / UPI / Online
                </span>
                <span className="font-bold text-white">
                  {formatINR(upiCollected)} ({upiPercent}%)
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${Math.max(5, upiPercent)}%` }}
                />
              </div>
            </div>

            {/* Bank Transfer */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Direct Bank Wire / NEFT
                </span>
                <span className="font-bold text-white">
                  {formatINR(bankCollected)} ({bankPercent}%)
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                  style={{ width: `${Math.max(0, bankPercent)}%` }}
                />
              </div>
            </div>

            {/* Cash / Cheque */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Cash / Cheque On Delivery
                </span>
                <span className="font-bold text-white">
                  {formatINR(cashOrOtherCollected)} ({otherPercent}%)
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                  style={{ width: `${Math.max(0, otherPercent)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-2.5 text-xs">
            <span className="text-slate-400 text-[11px]">Total Collected:</span>
            <span className="font-bold text-amber-400">{formatINR(totalCollected)}</span>
          </div>
        </div>

        {/* WIDGET 2: Order Status Distribution */}
        <div className="rounded-2xl border border-white/10 bg-[#0d121e]/80 p-4 shadow-lg backdrop-blur-xl lg:col-span-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Status Distribution</h3>
              <p className="text-[10px] text-slate-400">Active or completed invoices in this window.</p>
            </div>
          </div>

          <div className="mt-3.5 space-y-2">
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-2 text-xs">
              <span className="flex items-center gap-2 font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Paid
              </span>
              <div className="flex items-center gap-2.5">
                <span className="text-slate-400 text-[11px]">{invoiceCount > 0 ? Math.round((paidCount / invoiceCount) * 100) : 0}%</span>
                <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 font-bold text-emerald-300 text-[11px]">{paidCount}</span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-2 text-xs">
              <span className="flex items-center gap-2 font-medium text-blue-400">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> Partially Paid
              </span>
              <div className="flex items-center gap-2.5">
                <span className="text-slate-400 text-[11px]">{invoiceCount > 0 ? Math.round((partiallyPaidCount / invoiceCount) * 100) : 0}%</span>
                <span className="rounded-md bg-blue-500/20 px-1.5 py-0.5 font-bold text-blue-300 text-[11px]">{partiallyPaidCount}</span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-2 text-xs">
              <span className="flex items-center gap-2 font-medium text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Pending / Unpaid
              </span>
              <div className="flex items-center gap-2.5">
                <span className="text-slate-400 text-[11px]">{invoiceCount > 0 ? Math.round((unpaidCount / invoiceCount) * 100) : 0}%</span>
                <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 font-bold text-amber-300 text-[11px]">{unpaidCount}</span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-2 text-xs">
              <span className="flex items-center gap-2 font-medium text-red-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" /> Overdue
              </span>
              <div className="flex items-center gap-2.5">
                <span className="text-slate-400 text-[11px]">{invoiceCount > 0 ? Math.round((overdueCount / invoiceCount) * 100) : 0}%</span>
                <span className="rounded-md bg-red-500/20 px-1.5 py-0.5 font-bold text-red-300 text-[11px]">{overdueCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* WIDGET 3: Recent Activity & Top Billed Invoices */}
        <div className="rounded-2xl border border-white/10 bg-[#0d121e]/80 p-4 shadow-lg backdrop-blur-xl lg:col-span-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Latest Invoices</h3>
                <p className="text-[10px] text-slate-400">Ranked by recent generation.</p>
              </div>
            </div>
            <Link
              href="/dashboard/invoices"
              className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="mt-3 space-y-2">
            {recentInvoices.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">
                No invoices created yet.
              </p>
            ) : (
              recentInvoices.slice(0, 4).map((inv, idx) => (
                <Link
                  key={inv.id}
                  href={`/dashboard/invoices/${inv.id}`}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-2 transition hover:border-amber-500/30 hover:bg-white/[0.05]"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/20 text-[10px] font-bold text-amber-300">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-white leading-tight">
                        {inv.customer.companyName}
                      </p>
                      <p className="text-[10px] text-slate-400">{inv.invoiceNumber}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-white">{formatINR(inv.grandTotal)}</p>
                    <span
                      className={`inline-block rounded-md px-1.5 py-0.2 text-[9px] font-bold ${
                        inv.paymentStatus === "PAID"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : inv.paymentStatus === "UNPAID"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-blue-500/20 text-blue-300"
                      }`}
                    >
                      {inv.paymentStatus}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          FULL RECENT INVOICES GLASS REGISTER
      ========================================================= */}
      <div className="rounded-2xl border border-white/10 bg-[#0d121e]/80 p-4 shadow-lg backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2.5">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recent Invoices Register</h2>
            <p className="text-[11px] text-slate-400">Complete listing of recent tax invoices and client billing status.</p>
          </div>
          <Link
            href="/dashboard/invoices"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-500">
            No invoices yet. Click "Create Invoice" to generate your first invoice.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10 text-left uppercase text-slate-400 text-[10px]">
                  <th className="pb-2.5 pr-3 font-semibold">Invoice #</th>
                  <th className="pb-2.5 pr-3 font-semibold">Customer</th>
                  <th className="pb-2.5 pr-3 font-semibold">Date</th>
                  <th className="pb-2.5 pr-3 font-semibold">Grand Total</th>
                  <th className="pb-2.5 pr-3 font-semibold">Status</th>
                  <th className="pb-2.5 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentInvoices.map((inv) => (
                  <tr key={inv.id} className="transition hover:bg-white/[0.03]">
                    <td className="py-2.5 pr-3 font-semibold text-amber-400">
                      <Link href={`/dashboard/invoices/${inv.id}`} className="hover:underline">
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-3 font-medium text-white">{inv.customer.companyName}</td>
                    <td className="py-2.5 pr-3 text-slate-400">{formatDate(inv.invoiceDate)}</td>
                    <td className="py-2.5 pr-3 font-bold text-white">{formatINR(inv.grandTotal)}</td>
                    <td className="py-2.5 pr-3">
                      <StatusBadge status={inv.paymentStatus} />
                    </td>
                    <td className="py-2.5 text-right">
                      <Link
                        href={`/dashboard/invoices/${inv.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium text-slate-300 hover:border-amber-500/40 hover:text-amber-300 transition"
                      >
                        Details <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PAID: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
    UNPAID: "border-amber-500/30 bg-amber-500/15 text-amber-300",
    PARTIALLY_PAID: "border-blue-500/30 bg-blue-500/15 text-blue-300",
    OVERDUE: "border-red-500/30 bg-red-500/15 text-red-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
        styles[status] || "border-slate-500/30 bg-slate-500/15 text-slate-300"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatINR, formatDate } from "@/lib/calculations";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  FileText,
  Users,
  IndianRupee,
  Layers,
  Sparkles,
  CreditCard,
  Calendar,
  Package,
  Plus,
  ChevronRight,
} from "lucide-react";
import { StatusBadge } from "@/components/invoice/status-badge";

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
      take: 6,
    }),
    prisma.invoice.findMany({
      select: {
        grandTotal: true,
        amountPaid: true,
        balanceDue: true,
        paymentStatus: true,
        paymentMethod: true,
        dueDate: true,
      },
    }),
    prisma.customer.findMany({
      select: { gstin: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalCollected = allInvoices.reduce((sum, inv) => sum + (Number(inv.amountPaid) || 0), 0);
  const totalInvoiced = allInvoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
  const totalOutstanding = allInvoices.reduce((sum, inv) => sum + (Number(inv.balanceDue) || 0), 0);

  const now = new Date();
  const overdueInvoices = allInvoices.filter(
    (inv) => inv.paymentStatus !== "PAID" && new Date(inv.dueDate) < now
  );
  const paidCount = allInvoices.filter((i) => i.paymentStatus === "PAID").length;
  const partiallyPaidCount = allInvoices.filter((i) => i.paymentStatus === "PARTIALLY_PAID").length;
  const unpaidCount = allInvoices.filter((i) => i.paymentStatus === "UNPAID").length;
  const overdueCount = overdueInvoices.length;

  const gstCustomersCount = allCustomers.filter((c) => Boolean(c.gstin && c.gstin.trim())).length;
  const nonGstCustomersCount = customerCount - gstCustomersCount;

  const paidPct = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;
  const duePct = totalInvoiced > 0 ? Math.round((totalOutstanding / totalInvoiced) * 100) : 0;

  const upiCollected = allInvoices
    .filter((i) => i.paymentMethod === "UPI")
    .reduce((sum, i) => sum + (Number(i.amountPaid) || 0), 0);
  const bankCollected = allInvoices
    .filter((i) => i.paymentMethod === "Bank Transfer")
    .reduce((sum, i) => sum + (Number(i.amountPaid) || 0), 0);
  const cashOrOtherCollected = allInvoices
    .filter((i) => i.paymentMethod !== "UPI" && i.paymentMethod !== "Bank Transfer")
    .reduce((sum, i) => sum + (Number(i.amountPaid) || 0), 0);

  const currentMonthName = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#133b24]/10 px-2.5 py-0.5 text-xs font-bold text-[#0c2e1b] border border-[#133b24]/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Financial Overview
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0c2317] tracking-tight">
            Dashboard Analytics
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm font-medium text-[#526b5c]">
            Dynamic sales intelligence, collected payment reconciliation, and order performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-full border border-[#d8e5dc] bg-[#eef5f0] p-1 shadow-xs">
          <button
            type="button"
            className="rounded-full px-3 py-1 text-xs font-semibold text-[#526b5c] hover:text-[#0c2317] hover:bg-white/60 transition"
          >
            Today
          </button>
          <button
            type="button"
            className="rounded-full px-3 py-1 text-xs font-semibold text-[#526b5c] hover:text-[#0c2317] hover:bg-white/60 transition"
          >
            This Week
          </button>
          <button
            type="button"
            className="rounded-full bg-white px-3.5 py-1 text-xs font-bold text-[#0c2317] shadow-sm border border-[#d1ded5] transition"
          >
            This Month
          </button>
          <button
            type="button"
            className="rounded-full px-3 py-1 text-xs font-semibold text-[#526b5c] hover:text-[#0c2317] hover:bg-white/60 transition"
          >
            Month Wise
          </button>
          <button
            type="button"
            className="rounded-full px-3 py-1 text-xs font-semibold text-[#526b5c] hover:text-[#0c2317] hover:bg-white/60 transition"
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-[#cbe0d2] bg-[#eaf4ed] px-4 py-2.5 text-xs text-[#0c2e1b] shadow-xs">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#0c2e1b]" />
          <span>
            Viewing metrics for: <strong className="text-[#0c2317] font-bold">This Month ({currentMonthName})</strong>
          </span>
          <span className="text-[#355240] hidden sm:inline">
            · {invoiceCount} invoices generated · {paidPct}% revenue collected
          </span>
        </div>
        <Link
          href="/dashboard/invoices/new"
          className="flex items-center gap-1 font-bold text-[#0c2e1b] hover:underline"
        >
          Create New <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col justify-between rounded-2xl border border-[#e1ece3] bg-white p-5 shadow-[0_2px_12px_rgba(13,40,24,0.04)] transition hover:border-[#0c2e1b]/30">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#355240]">
                <IndianRupee className="h-3.5 w-3.5 text-[#355240]" /> Net Collected Revenue
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eaf2ec] text-[#0c2e1b]">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="mt-2.5">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0c2317]">
                {formatINR(totalCollected)}
              </h3>
              <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#0c2e1b] px-2.5 py-0.5 text-[10px] font-bold text-[#5ee496]">
                <span>{paidPct}%</span>
                <span className="font-normal text-[#a2d8b5]">of total billed</span>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-1.5 border-t border-[#edf2ee] pt-3 text-xs text-[#526b5c]">
            <div className="flex justify-between">
              <span>Online (UPI):</span>
              <span className="font-semibold text-[#0c2317]">{formatINR(upiCollected)}</span>
            </div>
            <div className="flex justify-between">
              <span>Bank / Wire:</span>
              <span className="font-semibold text-[#0c2317]">{formatINR(bankCollected + cashOrOtherCollected)}</span>
            </div>
            <div className="flex justify-between font-bold text-[#0c2317] pt-0.5">
              <span className="text-[#355240]">Gross Invoiced:</span>
              <span>{formatINR(totalInvoiced)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-[#e1ece3] bg-white p-5 shadow-[0_2px_12px_rgba(13,40,24,0.04)] transition hover:border-[#0c2e1b]/30">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#355240]">
                <FileText className="h-3.5 w-3.5 text-[#355240]" /> Invoices in Period
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eaf2ec] text-[#0c2e1b]">
                <FileText className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="mt-2.5">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0c2317]">
                {invoiceCount}
              </h3>
              <p className="mt-1 text-xs text-[#526b5c]">
                {paidCount} paid & fulfilled transactions
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-[#edf2ee] pt-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-[#eaf2ec] px-3 py-1.5">
                <span className="text-[#0c2e1b] font-medium">Paid</span>
                <span className="font-bold text-[#0c2317]">{paidCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[#eaf2ec] px-3 py-1.5">
                <span className="text-[#0c2e1b] font-medium">Partial</span>
                <span className="font-bold text-[#0c2317]">{partiallyPaidCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[#eaf2ec] px-3 py-1.5">
                <span className="text-[#0c2e1b] font-medium">Pending</span>
                <span className="font-bold text-[#0c2317]">{unpaidCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[#eaf2ec] px-3 py-1.5">
                <span className="text-[#0c2e1b] font-medium">Overdue</span>
                <span className="font-bold text-[#0c2317]">{overdueCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-[#e1ece3] bg-white p-5 shadow-[0_2px_12px_rgba(13,40,24,0.04)] transition hover:border-[#0c2e1b]/30">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#355240]">
                <Package className="h-3.5 w-3.5 text-[#355240]" /> Services & Rates
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eaf2ec] text-[#0c2e1b]">
                <Layers className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="mt-2.5">
              <div className="flex items-baseline gap-1.5">
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0c2317]">
                  {packageCount}
                </h3>
                <span className="text-xs font-semibold text-[#526b5c]">packages</span>
              </div>
              <p className="mt-1 text-xs text-[#526b5c]">
                across {categoryCount} service domains
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-1.5 border-t border-[#edf2ee] pt-3 text-xs text-[#526b5c]">
            <div className="flex justify-between">
              <span>Categories:</span>
              <span className="font-semibold text-[#0c2317]">{categoryCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Master Bundles:</span>
              <span className="font-semibold text-[#0c2317]">{bundleCount}</span>
            </div>
            <div className="flex justify-between pt-0.5">
              <Link href="/dashboard/packages" className="text-[#0c2e1b] font-semibold hover:underline flex items-center gap-0.5">
                Manage Catalog ↗
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-[#e1ece3] bg-white p-5 shadow-[0_2px_12px_rgba(13,40,24,0.04)] transition hover:border-[#0c2e1b]/30">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#355240]">
                <Users className="h-3.5 w-3.5 text-[#355240]" /> Customer Accounts
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eaf2ec] text-[#0c2e1b]">
                <Users className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="mt-2.5">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0c2317]">
                {customerCount}
              </h3>
              <p className="mt-1 text-xs text-[#526b5c]">
                Total registered clients
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-1.5 border-t border-[#edf2ee] pt-3 text-xs text-[#526b5c]">
            <div className="flex justify-between">
              <span>GST Registered:</span>
              <span className="font-semibold text-[#0c2317]">{gstCustomersCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Standard:</span>
              <span className="font-semibold text-[#0c2317]">{nonGstCustomersCount}</span>
            </div>
            <div className="flex justify-between pt-0.5">
              <Link href="/dashboard/customers" className="text-[#0c2e1b] font-semibold hover:underline flex items-center gap-0.5">
                Manage Customers ↗
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-white border border-[#e1ece3] shadow-sm rounded-2xl p-6">
          <div className="flex items-center justify-between border-b border-[#e1ece3] pb-4">
            <div>
              <h2 className="text-base font-black text-[#0c2317]">Payment Health & Breakdown</h2>
              <p className="text-xs font-medium text-[#526b5c]">Distribution of all generated customer invoices</p>
            </div>
            <span className="text-xs font-bold text-[#0c2e1b] bg-[#f4f7f4] px-3 py-1 rounded-full border border-[#e1ece3]">
              {allInvoices.length} Invoices
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                <span className="text-emerald-800 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  Paid ({paidCount})
                </span>
                <span className="font-black text-emerald-700">{formatINR(totalCollected)} ({paidPct}%)</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#f4f7f4] overflow-hidden border border-[#e1ece3]">
                <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${paidPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                <span className="text-amber-800 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Outstanding Balance ({unpaidCount + partiallyPaidCount})
                </span>
                <span className="font-black text-amber-700">{formatINR(totalOutstanding)} ({duePct}%)</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#f4f7f4] overflow-hidden border border-[#e1ece3]">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${duePct}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#edf2ee] text-center text-xs">
              <div className="rounded-xl bg-[#f9fbf9] border border-[#e1ece3] p-3">
                <p className="text-[10px] uppercase font-bold text-[#526b5c]">Online (UPI)</p>
                <p className="font-bold text-[#0c2317] mt-0.5">{formatINR(upiCollected)}</p>
              </div>
              <div className="rounded-xl bg-[#f9fbf9] border border-[#e1ece3] p-3">
                <p className="text-[10px] uppercase font-bold text-[#526b5c]">Bank Wire</p>
                <p className="font-bold text-[#0c2317] mt-0.5">{formatINR(bankCollected)}</p>
              </div>
              <div className="rounded-xl bg-[#f9fbf9] border border-[#e1ece3] p-3">
                <p className="text-[10px] uppercase font-bold text-[#526b5c]">Cash / Other</p>
                <p className="font-bold text-[#0c2317] mt-0.5">{formatINR(cashOrOtherCollected)}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-white border border-[#e1ece3] shadow-sm rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-black text-[#0c2317] mb-1">Quick Actions</h2>
            <p className="text-xs font-medium text-[#526b5c] mb-4">Direct portal controls & navigation</p>

            <div className="space-y-2.5">
              <Link
                href="/dashboard/invoices/new"
                className="flex items-center justify-between rounded-xl bg-[#0c2e1b] px-4 py-3 text-xs font-bold text-[#f0c34e] hover:bg-[#133b24] transition shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-[#f0c34e]" /> Create New Invoice
                </span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/dashboard/customers"
                className="flex items-center justify-between rounded-xl border border-[#d2ded5] bg-[#f9fbf9] px-4 py-3 text-xs font-bold text-[#0c2317] hover:bg-[#edf4ef] transition"
              >
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#0c2e1b]" /> View Customer Directory
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-[#526b5c]" />
              </Link>
              <Link
                href="/dashboard/packages"
                className="flex items-center justify-between rounded-xl border border-[#d2ded5] bg-[#f9fbf9] px-4 py-3 text-xs font-bold text-[#0c2317] hover:bg-[#edf4ef] transition"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#0c2e1b]" /> Manage Main Package Combos
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-[#526b5c]" />
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center justify-between rounded-xl border border-[#d2ded5] bg-[#f9fbf9] px-4 py-3 text-xs font-bold text-[#0c2317] hover:bg-[#edf4ef] transition"
              >
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[#0c2e1b]" /> Company & Banking Settings
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-[#526b5c]" />
              </Link>
            </div>
          </div>
        </Card>
      </div>

      <Card className="bg-white border border-[#e1ece3] shadow-sm rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-black text-[#0c2317]">Recent Invoices</h2>
            <p className="text-xs font-medium text-[#526b5c]">Latest generated bills and transactions</p>
          </div>
          <Link
            href="/dashboard/invoices"
            className="text-xs font-bold text-[#0c2e1b] hover:underline flex items-center gap-1"
          >
            All Invoices →
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#e1ece3]">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#e1ece3] bg-[#f4f7f4] text-left text-[11px] font-bold uppercase tracking-wider text-[#526b5c]">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Paid</th>
                <th className="py-3 px-4">Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2ee] bg-white">
              {recentInvoices.map((inv) => (
                <tr key={inv.id} className="transition-colors hover:bg-[#f8faf8]">
                  <td className="py-3 px-4 font-black text-[#0c2e1b]">
                    <Link href={`/dashboard/invoices/${inv.id}`} className="hover:underline">
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#0c2317]">{inv.customer.companyName}</td>
                  <td className="py-3 px-4 text-[#526b5c] font-medium">{formatDate(inv.invoiceDate)}</td>
                  <td className="py-3 px-4 font-black text-[#0c2317]">{formatINR(inv.grandTotal)}</td>
                  <td className="py-3 px-4 font-bold text-[#0c2e1b]">{formatINR(inv.amountPaid)}</td>
                  <td className="py-3 px-4 font-bold text-[#b45309]">{formatINR(inv.balanceDue)}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={inv.paymentStatus} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/dashboard/invoices/${inv.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#d2ded5] bg-white px-2.5 py-1 text-[11px] font-bold text-[#0c2e1b] hover:bg-[#eaf2ec] transition shadow-2xs"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

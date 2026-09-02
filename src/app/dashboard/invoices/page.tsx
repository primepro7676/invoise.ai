import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR, formatDate } from "@/lib/calculations";
import { InvoiceFilters } from "@/components/invoice/invoice-filters";
import { InvoiceListActions } from "@/components/invoice/invoice-list-actions";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const invoices = await prisma.invoice.findMany({
    where: {
      AND: [
        status ? { paymentStatus: status as never } : {},
        q
          ? {
              OR: [
                { invoiceNumber: { contains: q } },
                { customer: { companyName: { contains: q } } },
              ],
            }
          : {},
      ],
    },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });

  const totals = invoices.reduce(
    (a, i) => ({
      total: a.total + i.grandTotal,
      paid: a.paid + i.amountPaid,
      due: a.due + i.balanceDue,
    }),
    { total: 0, paid: 0, due: 0 }
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Invoices</h1>
          <p className="mt-1 text-sm text-slate-400">{invoices.length} total generated invoices</p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button>
            <Plus className="h-4 w-4" /> Create Invoice
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Mini label="Total Invoiced Value" value={formatINR(totals.total)} />
        <Mini label="Amount Collected" value={formatINR(totals.paid)} highlight />
        <Mini label="Total Balance Due" value={formatINR(totals.due)} due />
      </div>

      <InvoiceFilters defaultQuery={q || ""} defaultStatus={status || ""} />

      <Card>
        {invoices.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">No invoices found matching criteria.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10 text-left uppercase text-slate-400">
                  <th className="pb-3 pr-4 font-semibold">Invoice #</th>
                  <th className="pb-3 pr-4 font-semibold">Customer / Company</th>
                  <th className="pb-3 pr-4 font-semibold">Date</th>
                  <th className="pb-3 pr-4 font-semibold">Total Amount</th>
                  <th className="pb-3 pr-4 font-semibold">Paid</th>
                  <th className="pb-3 pr-4 font-semibold">Balance Due</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                  <th className="pb-3 pr-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="transition hover:bg-white/[0.03]">
                    <td className="py-3 pr-4 font-semibold text-amber-400">
                      <Link href={`/dashboard/invoices/${inv.id}`} className="hover:underline">
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 font-medium text-white">{inv.customer.companyName}</td>
                    <td className="py-3 pr-4 text-slate-400">{formatDate(inv.invoiceDate)}</td>
                    <td className="py-3 pr-4 font-bold text-white">{formatINR(inv.grandTotal)}</td>
                    <td className="py-3 pr-4 font-semibold text-emerald-400">{formatINR(inv.amountPaid)}</td>
                    <td className="py-3 pr-4 font-semibold text-amber-300">{formatINR(inv.balanceDue)}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={inv.paymentStatus} />
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <InvoiceListActions
                        invoiceId={inv.id}
                        invoiceNumber={inv.invoiceNumber}
                        customerName={inv.customer.companyName}
                        customerPhone={inv.customer.phone}
                        total={inv.grandTotal}
                        paid={inv.amountPaid}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function Mini({
  label,
  value,
  highlight = false,
  due = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  due?: boolean;
}) {
  return (
    <Card className="py-4 border-white/10 bg-[#0e1320]/80 backdrop-blur-xl">
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
      <p
        className={`mt-1 text-2xl font-black ${
          highlight ? "text-emerald-400" : due ? "text-amber-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </Card>
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
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        styles[status] || "border-slate-500/30 bg-slate-500/15 text-slate-300"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatINR, formatDate } from "@/lib/calculations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InvoiceFilters } from "@/components/invoice/invoice-filters";
import { InvoiceListActions } from "@/components/invoice/invoice-list-actions";
import { StatusBadge } from "@/components/invoice/status-badge";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;

  const where: Prisma.InvoiceWhereInput = {};
  if (status && status !== "ALL") {
    where.paymentStatus = status as Prisma.EnumPaymentStatusFilter;
  }
  if (q && q.trim()) {
    where.OR = [
      { invoiceNumber: { contains: q } },
      { customer: { companyName: { contains: q } } },
      { customer: { contactPerson: { contains: q } } },
      { customer: { email: { contains: q } } },
      { customer: { phone: { contains: q } } },
    ];
  }

  const invoices = await prisma.invoice.findMany({
    where,
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
          <h1 className="text-2xl sm:text-3xl font-black text-[#0c2317] tracking-tight">Invoices</h1>
          <p className="mt-1 text-xs sm:text-sm font-medium text-[#526b5c]">{invoices.length} total generated invoices</p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button className="font-bold shadow-sm gap-1.5">
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

      <Card className="bg-white border border-[#e1ece3] shadow-sm rounded-2xl p-5">
        {invoices.length === 0 ? (
          <p className="py-12 text-center text-sm font-semibold text-[#526b5c]">No invoices found matching criteria.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#e1ece3]">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#e1ece3] bg-[#f4f7f4] text-left text-[11px] font-bold uppercase tracking-wider text-[#526b5c]">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer / Company</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Balance Due</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1ece3] bg-white">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="transition-colors hover:bg-[#f4f7f4]">
                    <td className="py-3.5 px-4 font-black text-[#0c2e1b]">
                      <Link href={`/dashboard/invoices/${inv.id}`} className="hover:underline">
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#0c2317]">{inv.customer.companyName}</td>
                    <td className="py-3.5 px-4 text-[#526b5c] font-medium">{formatDate(inv.invoiceDate)}</td>
                    <td className="py-3.5 px-4 font-black text-[#0c2317]">{formatINR(inv.grandTotal)}</td>
                    <td className="py-3.5 px-4 font-bold text-[#0c2e1b]">{formatINR(inv.amountPaid)}</td>
                    <td className="py-3.5 px-4 font-bold text-[#b45309]">{formatINR(inv.balanceDue)}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={inv.paymentStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
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
    <Card className="py-4 px-5 border border-[#e1ece3] bg-white rounded-2xl shadow-sm">
      <p className="text-xs text-[#526b5c] font-bold uppercase tracking-wider">{label}</p>
      <p
        className={`mt-1 text-2xl font-black ${
          highlight ? "text-[#0c2e1b]" : due ? "text-[#b45309]" : "text-[#0c2317]"
        }`}
      >
        {value}
      </p>
    </Card>
  );
}

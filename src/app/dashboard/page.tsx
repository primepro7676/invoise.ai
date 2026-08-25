import Link from "next/link";
import { FileText, Users, IndianRupee, AlertCircle, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR, formatDate } from "@/lib/calculations";

export default async function DashboardPage() {
  const [invoiceCount, customerCount, invoices, allInvoices] = await Promise.all([
    prisma.invoice.count(),
    prisma.customer.count(),
    prisma.invoice.findMany({
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.invoice.findMany({ select: { grandTotal: true, amountPaid: true, balanceDue: true } }),
  ]);

  const totalRevenue = allInvoices.reduce((s: number, i: { amountPaid: number }) => s + i.amountPaid, 0);
  const totalInvoiced = allInvoices.reduce((s: number, i: { grandTotal: number }) => s + i.grandTotal, 0);
  const totalOutstanding = allInvoices.reduce((s: number, i: { balanceDue: number }) => s + i.balanceDue, 0);
  const outstandingCount = await prisma.invoice.count({
    where: { paymentStatus: { in: ["UNPAID", "PARTIALLY_PAID", "OVERDUE"] } },
  });

  const stats = [
    { label: "Total Invoices", value: invoiceCount, icon: FileText },
    { label: "Total Customers", value: customerCount, icon: Users },
    { label: "Amount Received", value: formatINR(totalRevenue), icon: IndianRupee },
    { label: "Outstanding Amount", value: formatINR(totalOutstanding), icon: AlertCircle },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Dashboard</h1>
          <p className="text-sm text-navy-600/70">Overview of your billing activity · Total invoiced {formatINR(totalInvoiced)}</p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button>
            <Plus className="h-4 w-4" /> Create Invoice
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-navy-600/60">{s.label}</p>
              <p className="text-lg font-semibold text-navy-900">{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-navy-900">Recent Invoices</h2>
          <Link href="/dashboard/invoices" className="text-sm font-medium text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        {invoices.length === 0 ? (
          <p className="py-8 text-center text-sm text-navy-600/60">
            No invoices yet. Create your first invoice to see it here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-100 text-left text-xs uppercase text-navy-600/60">
                  <th className="pb-2 pr-4">Invoice #</th>
                  <th className="pb-2 pr-4">Customer</th>
                  <th className="pb-2 pr-4">Date</th>
                  <th className="pb-2 pr-4">Amount</th>
                  <th className="pb-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(
                  (inv: {
                    id: string;
                    invoiceNumber: string;
                    invoiceDate: Date;
                    grandTotal: number;
                    paymentStatus: string;
                    customer: { companyName: string };
                  }) => (
                    <tr key={inv.id} className="border-b border-brand-50 last:border-0">
                      <td className="py-2.5 pr-4">
                        <Link href={`/dashboard/invoices/${inv.id}`} className="font-medium text-brand-700 hover:underline">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4 text-navy-800">{inv.customer.companyName}</td>
                      <td className="py-2.5 pr-4 text-navy-600/70">{formatDate(inv.invoiceDate)}</td>
                      <td className="py-2.5 pr-4 font-medium text-navy-900">{formatINR(inv.grandTotal)}</td>
                      <td className="py-2.5 pr-4">
                        <StatusBadge status={inv.paymentStatus} />
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PAID: "bg-brand-100 text-brand-700",
    UNPAID: "bg-amber-100 text-amber-700",
    PARTIALLY_PAID: "bg-blue-100 text-blue-700",
    OVERDUE: "bg-red-100 text-red-700",
  };
  return <span className={`badge ${styles[status] || "bg-gray-100 text-gray-700"}`}>{status.replace("_", " ")}</span>;
}

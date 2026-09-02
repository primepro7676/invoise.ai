import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { formatINR, formatDate } from "@/lib/calculations";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { invoices: { orderBy: { createdAt: "desc" } } },
  });
  if (!customer) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{customer.companyName}</h1>
        <p className="mt-1 text-sm text-slate-400">{customer.email} · {customer.phone}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-amber-400">Details</h2>
          <div className="space-y-2 text-sm text-slate-300">
            {customer.contactPerson && <p className="font-semibold text-white">Attn: {customer.contactPerson}</p>}
            <p className="text-slate-300">{customer.billingAddress}</p>
            <p className="text-slate-400">
              {customer.city}, {customer.state} — {customer.pincode}
            </p>
            <p className="text-slate-400">{customer.country}</p>
            {customer.gstin && (
              <p className="mt-3 inline-block rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-amber-300">
                GSTIN: {customer.gstin}
              </p>
            )}
            <p className="text-xs text-slate-400 pt-1">Place of Supply: <span className="text-slate-200 font-medium">{customer.placeOfSupply}</span></p>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-amber-400">Invoice History</h2>
          {customer.invoices.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No invoices yet for this customer.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-left uppercase text-slate-400">
                    <th className="py-3 pr-3 font-semibold">Invoice #</th>
                    <th className="py-3 pr-3 font-semibold">Date</th>
                    <th className="py-3 pr-3 font-semibold">Amount</th>
                    <th className="py-3 pr-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {customer.invoices.map(
                    (inv: {
                      id: string;
                      invoiceNumber: string;
                      invoiceDate: Date;
                      grandTotal: number;
                      paymentStatus: string;
                    }) => (
                      <tr key={inv.id} className="transition hover:bg-white/[0.03]">
                        <td className="py-3 pr-3 font-semibold text-amber-400">
                          <Link href={`/dashboard/invoices/${inv.id}`} className="hover:underline">
                            {inv.invoiceNumber}
                          </Link>
                        </td>
                        <td className="py-3 pr-3 text-slate-400">{formatDate(inv.invoiceDate)}</td>
                        <td className="py-3 pr-3 font-bold text-white">{formatINR(inv.grandTotal)}</td>
                        <td className="py-3 pr-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              inv.paymentStatus === "PAID"
                                ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                                : inv.paymentStatus === "UNPAID"
                                ? "border-amber-500/30 bg-amber-500/15 text-amber-300"
                                : inv.paymentStatus === "PARTIALLY_PAID"
                                ? "border-blue-500/30 bg-blue-500/15 text-blue-300"
                                : "border-red-500/30 bg-red-500/15 text-red-300"
                            }`}
                          >
                            {inv.paymentStatus.replace("_", " ")}
                          </span>
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
    </div>
  );
}

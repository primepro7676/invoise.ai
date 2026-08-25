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
        <h1 className="text-2xl font-semibold text-navy-900">{customer.companyName}</h1>
        <p className="text-sm text-navy-600/70">{customer.email} · {customer.phone}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h2 className="mb-3 text-sm font-semibold uppercase text-brand-700">Details</h2>
          {customer.contactPerson && <p className="text-sm text-navy-700">Attn: {customer.contactPerson}</p>}
          <p className="mt-1 text-sm text-navy-700">{customer.billingAddress}</p>
          <p className="text-sm text-navy-700">
            {customer.city}, {customer.state} — {customer.pincode}
          </p>
          <p className="text-sm text-navy-700">{customer.country}</p>
          {customer.gstin && <p className="mt-2 text-sm text-navy-700">GSTIN: {customer.gstin}</p>}
          <p className="text-sm text-navy-700">Place of Supply: {customer.placeOfSupply}</p>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold uppercase text-brand-700">Invoice History</h2>
          {customer.invoices.length === 0 ? (
            <p className="py-6 text-center text-sm text-navy-600/60">No invoices yet for this customer.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-100 text-left text-xs uppercase text-navy-600/60">
                    <th className="py-2 pr-3">Invoice #</th>
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Amount</th>
                    <th className="py-2 pr-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.invoices.map(
                    (inv: {
                      id: string;
                      invoiceNumber: string;
                      invoiceDate: Date;
                      grandTotal: number;
                      paymentStatus: string;
                    }) => (
                      <tr key={inv.id} className="border-b border-brand-50 last:border-0">
                        <td className="py-2.5 pr-3">
                          <Link href={`/dashboard/invoices/${inv.id}`} className="font-medium text-brand-700 hover:underline">
                            {inv.invoiceNumber}
                          </Link>
                        </td>
                        <td className="py-2.5 pr-3 text-navy-600/70">{formatDate(inv.invoiceDate)}</td>
                        <td className="py-2.5 pr-3 font-medium text-navy-900">{formatINR(inv.grandTotal)}</td>
                        <td className="py-2.5 pr-3 text-navy-600/70">{inv.paymentStatus.replace("_", " ")}</td>
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

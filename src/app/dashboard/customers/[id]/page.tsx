import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { formatINR, formatDate } from "@/lib/calculations";
import { ArrowLeft, Building2, Mail, Phone, Receipt, ShieldCheck } from "lucide-react";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { invoices: { orderBy: { createdAt: "desc" } } },
  });
  if (!customer) notFound();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/customers"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#526b5c] hover:text-[#0c2e1b] transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Customers
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0c2317] tracking-tight flex items-center gap-3">
            <Building2 className="h-7 w-7 text-[#0c2e1b]" />
            {customer.companyName}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-4 text-xs font-medium text-[#526b5c]">
            <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-[#8aa393]" /> {customer.email}</span>
            <span>·</span>
            <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[#8aa393]" /> {customer.phone}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Customer Information Card */}
        <Card className="lg:col-span-1 bg-white border border-[#e1ece3] shadow-sm rounded-2xl p-6">
          <h2 className="mb-4 text-xs font-black uppercase tracking-wider text-[#0c2e1b] flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#0c2e1b]" /> Company Details
          </h2>
          <div className="space-y-3 text-xs text-[#526b5c]">
            {customer.contactPerson && (
              <div className="bg-[#f4f7f4] p-3 rounded-xl border border-[#e1ece3]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8aa393]">Contact Person</p>
                <p className="font-bold text-sm text-[#0c2317] mt-0.5">{customer.contactPerson}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8aa393] mb-1">Billing Address</p>
              <p className="text-xs font-medium text-[#0c2317] leading-relaxed">{customer.billingAddress}</p>
              <p className="text-xs text-[#526b5c] mt-0.5">
                {customer.city}, {customer.state} — {customer.pincode}
              </p>
              <p className="text-xs text-[#526b5c]">{customer.country}</p>
            </div>

            {customer.gstin && (
              <div className="pt-2">
                <span className="inline-block rounded-lg border border-[#e1ece3] bg-[#f4f7f4] px-3 py-1.5 text-xs font-bold text-[#0c2e1b]">
                  GSTIN: {customer.gstin}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-[#e1ece3]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8aa393]">Place of Supply</p>
              <p className="text-xs font-bold text-[#0c2317] mt-0.5">{customer.placeOfSupply}</p>
            </div>
          </div>
        </Card>

        {/* Invoice History Card */}
        <Card className="lg:col-span-2 bg-white border border-[#e1ece3] shadow-sm rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#0c2e1b] flex items-center gap-2">
              <Receipt className="h-4 w-4 text-[#0c2e1b]" /> Invoice History
            </h2>
            <span className="text-xs font-bold text-[#526b5c] bg-[#f4f7f4] px-2.5 py-1 rounded-full border border-[#e1ece3]">
              {customer.invoices.length} {customer.invoices.length === 1 ? "Invoice" : "Invoices"}
            </span>
          </div>

          {customer.invoices.length === 0 ? (
            <div className="py-12 text-center">
              <Receipt className="h-10 w-10 text-[#8aa393] mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-[#526b5c]">No invoices yet for this customer.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#e1ece3]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#e1ece3] bg-[#f4f7f4] text-left text-[11px] font-bold uppercase tracking-wider text-[#526b5c]">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e1ece3] bg-white">
                  {customer.invoices.map(
                    (inv: {
                      id: string;
                      invoiceNumber: string;
                      invoiceDate: Date;
                      grandTotal: number;
                      paymentStatus: string;
                    }) => (
                      <tr key={inv.id} className="transition-colors hover:bg-[#f4f7f4]">
                        <td className="py-3.5 px-4 font-black text-[#0c2e1b]">
                          <Link href={`/dashboard/invoices/${inv.id}`} className="hover:underline flex items-center gap-1.5">
                            {inv.invoiceNumber}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-[#526b5c] font-medium">{formatDate(inv.invoiceDate)}</td>
                        <td className="py-3.5 px-4 font-black text-[#0c2317]">{formatINR(inv.grandTotal)}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              inv.paymentStatus === "PAID"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : inv.paymentStatus === "UNPAID"
                                ? "border-amber-200 bg-amber-50 text-amber-800"
                                : inv.paymentStatus === "PARTIALLY_PAID"
                                ? "border-blue-200 bg-blue-50 text-blue-800"
                                : "border-rose-200 bg-rose-50 text-rose-800"
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

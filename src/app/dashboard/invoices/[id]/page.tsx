import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { formatINR, formatDate } from "@/lib/calculations";
import { InvoiceActions } from "@/components/invoice/invoice-actions";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, lineItems: { orderBy: { sortOrder: "asc" } } },
  });
  if (!invoice) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">{invoice.invoiceNumber}</h1>
          <p className="text-sm text-navy-600/70">
            Issued {formatDate(invoice.invoiceDate)} · Due {formatDate(invoice.dueDate)}
          </p>
        </div>
        <InvoiceActions invoiceId={invoice.id} currentStatus={invoice.paymentStatus} amountPaid={invoice.amountPaid} grandTotal={invoice.grandTotal} customerName={invoice.customer.companyName} customerPhone={invoice.customer.phone} invoiceNumber={invoice.invoiceNumber} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h2 className="mb-3 text-sm font-semibold uppercase text-brand-700">Bill To</h2>
            <p className="text-base font-semibold text-navy-900">{invoice.customer.companyName}</p>
            {invoice.customer.contactPerson && (
              <p className="text-sm text-navy-600/70">Attn: {invoice.customer.contactPerson}</p>
            )}
            <p className="mt-1 text-sm text-navy-700">{invoice.customer.billingAddress}</p>
            <p className="text-sm text-navy-700">
              {invoice.customer.city}, {invoice.customer.state} — {invoice.customer.pincode}
            </p>
            <p className="text-sm text-navy-700">{invoice.customer.country}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-navy-600/80">
              <p>Phone: {invoice.customer.phone}</p>
              <p>Email: {invoice.customer.email}</p>
              {invoice.customer.gstin && <p>GSTIN: {invoice.customer.gstin}</p>}
              <p>Place of Supply: {invoice.customer.placeOfSupply}</p>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold uppercase text-brand-700">Services</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-100 text-left text-xs uppercase text-navy-600/60">
                    <th className="py-2 pr-3">Service</th>
                    <th className="py-2 pr-3">Package</th>
                    <th className="py-2 pr-3 text-center">Qty</th>
                    <th className="py-2 pr-3 text-right">Rate</th>
                    <th className="py-2 pr-3 text-center">GST</th>
                    <th className="py-2 pr-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map(
                    (li: {
                      id: string;
                      categoryName: string;
                      packageName: string;
                      quantity: number;
                      rate: number;
                      gstPercent: number;
                      total: number;
                    }) => (
                      <tr key={li.id} className="border-b border-brand-50 last:border-0">
                        <td className="py-2.5 pr-3 text-navy-900">{li.categoryName}</td>
                        <td className="py-2.5 pr-3 text-navy-700">{li.packageName}</td>
                        <td className="py-2.5 pr-3 text-center text-navy-700">{li.quantity}</td>
                        <td className="py-2.5 pr-3 text-right text-navy-700">{formatINR(li.rate)}</td>
                        <td className="py-2.5 pr-3 text-center text-navy-700">
                          {invoice.gstEnabled ? `${li.gstPercent}%` : "—"}
                        </td>
                        <td className="py-2.5 pr-3 text-right font-medium text-navy-900">{formatINR(li.total)}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold uppercase text-brand-700">Payment</h2>
            <div className="grid grid-cols-2 gap-2 text-sm text-navy-700">
              <p>Method: {invoice.paymentMethod}</p>
              {invoice.upiId && <p>UPI ID: {invoice.upiId}</p>}
              {invoice.transactionRef && <p>Reference: {invoice.transactionRef}</p>}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-brand-200 bg-brand-50/40">
            <h2 className="mb-3 text-sm font-semibold uppercase text-brand-700">Totals</h2>
            <Row label="Subtotal" value={formatINR(invoice.subtotal)} />
            <Row label="Discount" value={`- ${formatINR(invoice.discountAmount)}`} />
            <Row label="Taxable Amount" value={formatINR(invoice.taxableAmount)} />
            <Row label={`GST${invoice.gstEnabled ? ` @ ${invoice.gstPercent}%` : ""}`} value={formatINR(invoice.gstAmount)} />
            <div className="my-3 flex items-center justify-between rounded-lg bg-brand-600 px-3 py-2.5 text-white">
              <span className="text-sm font-medium">Grand Total</span>
              <span className="text-lg font-bold">{formatINR(invoice.grandTotal)}</span>
            </div>
            <Row label="Amount Paid" value={formatINR(invoice.amountPaid)} />
            <Row label="Balance Due" value={formatINR(invoice.balanceDue)} />
            <p className="mt-3 text-xs italic text-navy-600/70">{invoice.amountInWords}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-brand-100/60 py-1.5 text-sm last:border-0">
      <span className="text-navy-600/70">{label}</span>
      <span className="font-medium text-navy-900">{value}</span>
    </div>
  );
}

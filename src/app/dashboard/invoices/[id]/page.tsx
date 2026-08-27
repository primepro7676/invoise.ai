import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { formatINR, formatDate } from "@/lib/calculations";
import { InvoiceActions } from "@/components/invoice/invoice-actions";
import { parseInvoiceNotes } from "@/lib/validation";
import { CheckCircle2, Sparkles } from "lucide-react";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, lineItems: { orderBy: { sortOrder: "asc" } } },
  });
  if (!invoice) notFound();

  const packageMeta = parseInvoiceNotes(invoice.notes);
  const inclusions = packageMeta.packageInclusions
    ? packageMeta.packageInclusions
        .split("\n")
        .map((l) => l.trim().replace(/^[•\-\*]\s*/, ""))
        .filter(Boolean)
    : [];

  const platforms = packageMeta.platformsIncluded
    ? packageMeta.platformsIncluded
        .split("\n")
        .map((l) => l.trim().replace(/^[•\-\*]\s*/, ""))
        .filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">{invoice.invoiceNumber}</h1>
          <p className="text-sm text-navy-600/70">
            Issued {formatDate(invoice.invoiceDate)} · Due {formatDate(invoice.dueDate)}
          </p>
        </div>
        <InvoiceActions
          invoiceId={invoice.id}
          currentStatus={invoice.paymentStatus}
          amountPaid={invoice.amountPaid}
          grandTotal={invoice.grandTotal}
          customerName={invoice.customer.companyName}
          customerPhone={invoice.customer.phone}
          invoiceNumber={invoice.invoiceNumber}
        />
      </div>

      {/* Package Header Banner (if present) */}
      {packageMeta.packageTitle && (
        <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-brand-700">
            <Sparkles className="h-5 w-5" />
            <h2 className="text-lg font-bold uppercase tracking-wide">
              {packageMeta.packageTitle}
            </h2>
          </div>
          {packageMeta.packageSubtitle && (
            <p className="mt-1 text-sm font-medium text-navy-700">
              {packageMeta.packageSubtitle}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Bill To */}
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

          {/* Services Table */}
          <Card>
            <h2 className="mb-3 text-sm font-semibold uppercase text-brand-700">
              Services & Packages
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-100 text-left text-xs uppercase text-navy-600/60">
                    <th className="py-2 pr-3">Service</th>
                    <th className="py-2 pr-3">Package</th>
                    <th className="py-2 pr-3 text-center">Qty</th>
                    <th className="py-2 pr-3 text-right">Standard Price</th>
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
                        <td className="py-2.5 pr-3 font-medium text-navy-900">
                          {li.categoryName}
                        </td>
                        <td className="py-2.5 pr-3 text-navy-700">{li.packageName}</td>
                        <td className="py-2.5 pr-3 text-center text-navy-700">{li.quantity}</td>
                        <td className="py-2.5 pr-3 text-right text-navy-700">{formatINR(li.rate)}</td>
                        <td className="py-2.5 pr-3 text-right font-medium text-navy-900">
                          {formatINR(li.total)}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Package Deliverables & Scope (if any) */}
          {(inclusions.length > 0 || platforms.length > 0 || packageMeta.paymentTermsText || packageMeta.specialOfferNote) && (
            <Card className="border-emerald-200 bg-emerald-50/10">
              <h2 className="mb-3 text-sm font-semibold uppercase text-brand-700">
                Package Scope & Deliverables
              </h2>

              {platforms.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase text-navy-700">
                    Social Media Platforms Included
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {platforms.map((platform, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-800"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" />
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {inclusions.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase text-navy-700">
                    Package Includes & Deliverables
                  </p>
                  <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {inclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-navy-800">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {packageMeta.paymentTermsText && (
                <div className="mb-3 rounded-lg border border-brand-100 bg-white p-3">
                  <p className="text-xs font-semibold uppercase text-brand-800">Payment Terms</p>
                  <p className="mt-1 whitespace-pre-line text-sm text-navy-700">
                    {packageMeta.paymentTermsText}
                  </p>
                </div>
              )}

              {packageMeta.specialOfferNote && (
                <p className="text-xs font-medium italic text-navy-600">
                  {packageMeta.specialOfferNote}
                </p>
              )}
            </Card>
          )}

          {/* Payment Details */}
          <Card>
            <h2 className="mb-3 text-sm font-semibold uppercase text-brand-700">Payment Details</h2>
            <div className="grid grid-cols-2 gap-2 text-sm text-navy-700">
              <p>Method: {invoice.paymentMethod}</p>
              {invoice.upiId && <p>UPI ID: {invoice.upiId}</p>}
              {invoice.transactionRef && <p>Reference: {invoice.transactionRef}</p>}
            </div>
          </Card>
        </div>

        {/* Totals Sidebar */}
        <div className="space-y-6">
          <Card className="border-brand-200 bg-brand-50/40">
            <h2 className="mb-3 text-sm font-semibold uppercase text-brand-700">Invoice Summary</h2>
            <Row label="Total Value (Subtotal)" value={formatINR(invoice.subtotal)} />

            {invoice.discountAmount > 0 && (
              <>
                <Row
                  label={packageMeta.discountReason || "Special Discount"}
                  value={`- ${formatINR(invoice.discountAmount)}`}
                  highlight
                />
                <Row label="Final Package Price" value={formatINR(invoice.taxableAmount)} />
              </>
            )}

            {invoice.gstEnabled && (
              <Row
                label={`GST @ ${invoice.gstPercent}%`}
                value={formatINR(invoice.gstAmount)}
              />
            )}

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

function Row({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-brand-100/60 py-1.5 text-sm last:border-0">
      <span className={highlight ? "font-medium text-emerald-700" : "text-navy-600/70"}>
        {label}
      </span>
      <span className={`font-semibold ${highlight ? "text-emerald-700" : "text-navy-900"}`}>
        {value}
      </span>
    </div>
  );
}

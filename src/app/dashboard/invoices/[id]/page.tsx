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
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {invoice.invoiceNumber}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
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
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-[#0e1320]/90 to-[#080b11] p-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-2 text-amber-400">
            <Sparkles className="h-5 w-5" />
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-white">
              {packageMeta.packageTitle}
            </h2>
          </div>
          {packageMeta.packageSubtitle && (
            <p className="mt-1 text-xs sm:text-sm font-medium text-slate-300">
              {packageMeta.packageSubtitle}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Bill To */}
          <Card>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-amber-400">Bill To</h2>
            <p className="text-lg font-extrabold text-white">{invoice.customer.companyName}</p>
            {invoice.customer.contactPerson && (
              <p className="mt-0.5 text-xs text-slate-300">Attn: {invoice.customer.contactPerson}</p>
            )}
            <p className="mt-2 text-sm text-slate-300">{invoice.customer.billingAddress}</p>
            <p className="text-sm text-slate-400">
              {invoice.customer.city}, {invoice.customer.state} — {invoice.customer.pincode}
            </p>
            <p className="text-sm text-slate-400">{invoice.customer.country}</p>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs border-t border-white/10 pt-3">
              <p className="text-slate-400">Phone: <span className="text-white font-medium">{invoice.customer.phone}</span></p>
              <p className="text-slate-400">Email: <span className="text-white font-medium">{invoice.customer.email || "—"}</span></p>
              {invoice.customer.gstin && (
                <p className="text-slate-400">GSTIN: <span className="text-amber-300 font-semibold">{invoice.customer.gstin}</span></p>
              )}
              <p className="text-slate-400">Place of Supply: <span className="text-white font-medium">{invoice.customer.placeOfSupply}</span></p>
            </div>
          </Card>

          {/* Services Table */}
          <Card>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-amber-400">
              Services & Packages
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-left uppercase text-slate-400">
                    <th className="py-3 pr-3 font-semibold">Service</th>
                    <th className="py-3 pr-3 font-semibold">Package / Item</th>
                    <th className="py-3 pr-3 text-center font-semibold">Qty</th>
                    <th className="py-3 pr-3 text-right font-semibold">Standard Price</th>
                    <th className="py-3 pr-3 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invoice.lineItems.map((li) => (
                    <tr key={li.id} className="transition hover:bg-white/[0.03]">
                      <td className="py-3 pr-3 font-semibold text-white">
                        {li.categoryName}
                      </td>
                      <td className="py-3 pr-3 text-slate-300">{li.packageName}</td>
                      <td className="py-3 pr-3 text-center text-slate-300">{li.quantity}</td>
                      <td className="py-3 pr-3 text-right text-slate-400">{formatINR(li.rate)}</td>
                      <td className="py-3 pr-3 text-right font-bold text-white">
                        {formatINR(li.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Package Deliverables & Scope (if any) */}
          {(inclusions.length > 0 || platforms.length > 0 || packageMeta.paymentTermsText || packageMeta.specialOfferNote) && (
            <Card className="border-white/10">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-amber-400">
                Package Scope & Deliverables
              </h2>

              {platforms.length > 0 && (
                <div className="mb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Platforms Included
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {platforms.map((platform, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-200 backdrop-blur-md"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {inclusions.length > 0 && (
                <div className="mb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Deliverables & Inclusions
                  </p>
                  <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {inclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {packageMeta.paymentTermsText && (
                <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">Payment Terms</p>
                  <p className="mt-1 whitespace-pre-line text-xs text-slate-300">
                    {packageMeta.paymentTermsText}
                  </p>
                </div>
              )}

              {packageMeta.specialOfferNote && (
                <p className="text-xs font-medium italic text-slate-400">
                  {packageMeta.specialOfferNote}
                </p>
              )}
            </Card>
          )}

          {/* Payment Details */}
          <Card>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-amber-400">Payment Details</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <span className="text-slate-500 uppercase text-[10px]">Method</span>
                <p className="font-semibold text-white mt-0.5">{invoice.paymentMethod}</p>
              </div>
              {invoice.upiId && (
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <span className="text-slate-500 uppercase text-[10px]">UPI ID</span>
                  <p className="font-semibold text-white mt-0.5">{invoice.upiId}</p>
                </div>
              )}
              {invoice.transactionRef && (
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <span className="text-slate-500 uppercase text-[10px]">Reference</span>
                  <p className="font-semibold text-white mt-0.5">{invoice.transactionRef}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Totals Sidebar */}
        <div className="space-y-6">
          <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-[#0e1320] to-[#080b11]">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-amber-400">Invoice Summary</h2>
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

            {/* Glowing Golden-Amber Grand Total Banner (No harsh green) */}
            <div className="my-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3.5 text-black shadow-lg shadow-amber-500/25">
              <span className="text-xs font-bold uppercase tracking-wider">Grand Total</span>
              <span className="text-xl font-black">{formatINR(invoice.grandTotal)}</span>
            </div>

            <Row label="Amount Paid" value={formatINR(invoice.amountPaid)} />
            <Row label="Balance Due" value={formatINR(invoice.balanceDue)} />
            <p className="mt-3 text-[11px] italic text-slate-400 border-t border-white/10 pt-3">{invoice.amountInWords}</p>
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
    <div className="flex items-center justify-between border-b border-white/5 py-2 text-xs last:border-0">
      <span className={highlight ? "font-medium text-emerald-400" : "text-slate-400"}>
        {label}
      </span>
      <span className={`font-bold ${highlight ? "text-emerald-300" : "text-white"}`}>
        {value}
      </span>
    </div>
  );
}

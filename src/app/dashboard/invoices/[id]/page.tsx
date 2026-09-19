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
          <h1 className="text-2xl sm:text-3xl font-black text-[#0c2317] tracking-tight">
            {invoice.invoiceNumber}
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-medium text-[#526b5c]">
            Issued {formatDate(invoice.invoiceDate)} · Due {formatDate(invoice.dueDate)}
          </p>
        </div>
        <InvoiceActions
          invoiceId={invoice.id}
          currentStatus={invoice.paymentStatus}
          currentDueDate={invoice.dueDate.toISOString().slice(0, 10)}
          amountPaid={invoice.amountPaid}
          grandTotal={invoice.grandTotal}
          customerName={invoice.customer.companyName}
          customerPhone={invoice.customer.phone}
          invoiceNumber={invoice.invoiceNumber}
        />
      </div>

      {packageMeta.packageTitle && (
        <div className="rounded-2xl border border-[#c5dccb] bg-[#eaf2ec] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-[#0c2e1b]">
            <Sparkles className="h-5 w-5 text-[#0c2e1b]" />
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-[#0c2317]">
              {packageMeta.packageTitle}
            </h2>
          </div>
          {packageMeta.packageSubtitle && (
            <p className="mt-1 text-xs sm:text-sm font-medium text-[#355240]">
              {packageMeta.packageSubtitle}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="bg-white border border-[#e1ece3] shadow-sm rounded-2xl p-6">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#0c2e1b]">Bill To</h2>
            <p className="text-lg font-extrabold text-[#0c2317]">{invoice.customer.companyName}</p>
            {invoice.customer.contactPerson && (
              <p className="mt-0.5 text-xs font-medium text-[#355240]">Attn: {invoice.customer.contactPerson}</p>
            )}
            <p className="mt-2 text-sm text-[#355240]">{invoice.customer.billingAddress}</p>
            <p className="text-sm text-[#526b5c]">
              {invoice.customer.city}, {invoice.customer.state} — {invoice.customer.pincode}
            </p>
            <p className="text-sm text-[#526b5c]">{invoice.customer.country}</p>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs border-t border-[#edf2ee] pt-3">
              <p className="text-[#526b5c]">Phone: <span className="text-[#0c2317] font-semibold">{invoice.customer.phone}</span></p>
              <p className="text-[#526b5c]">Email: <span className="text-[#0c2317] font-semibold">{invoice.customer.email || "—"}</span></p>
              {invoice.customer.gstin && (
                <p className="text-[#526b5c]">GSTIN: <span className="text-[#0c2e1b] font-bold">{invoice.customer.gstin}</span></p>
              )}
              <p className="text-[#526b5c]">Place of Supply: <span className="text-[#0c2317] font-semibold">{invoice.customer.placeOfSupply}</span></p>
            </div>
          </Card>

          <Card className="bg-white border border-[#e1ece3] shadow-sm rounded-2xl p-6">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#0c2e1b]">
              Services & Packages
            </h2>
            <div className="overflow-x-auto rounded-xl border border-[#e1ece3]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#e1ece3] bg-[#f4f7f4] text-left text-[11px] font-bold uppercase tracking-wider text-[#526b5c]">
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Package / Item</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Standard Price</th>
                    <th className="py-3 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf2ee] bg-white">
                  {invoice.lineItems.map((li) => (
                    <tr key={li.id} className="transition-colors hover:bg-[#f8faf8]">
                      <td className="py-3.5 px-4 font-bold text-[#0c2317]">
                        {li.categoryName}
                      </td>
                      <td className="py-3.5 px-4 text-[#355240]">{li.packageName}</td>
                      <td className="py-3.5 px-4 text-center text-[#355240]">{li.quantity}</td>
                      <td className="py-3.5 px-4 text-right text-[#526b5c]">{formatINR(li.rate)}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#0c2317]">
                        {formatINR(li.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {(inclusions.length > 0 || platforms.length > 0 || packageMeta.paymentTermsText || packageMeta.specialOfferNote) && (
            <Card className="bg-white border border-[#e1ece3] shadow-sm rounded-2xl p-6">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#0c2e1b]">
                Package Scope & Deliverables
              </h2>

              {platforms.length > 0 && (
                <div className="mb-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#526b5c]">
                    Platforms Included
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {platforms.map((platform, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#d2ded5] bg-[#eaf2ec] px-2.5 py-1 text-xs font-semibold text-[#0c2e1b]"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#0c2e1b]" />
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {inclusions.length > 0 && (
                <div className="mb-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#526b5c]">
                    Deliverables & Inclusions
                  </p>
                  <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {inclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#355240]">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0c2e1b]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {packageMeta.paymentTermsText && (
                <div className="mb-3 rounded-xl border border-[#e1ece3] bg-[#f9fbf9] p-3.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#0c2e1b]">Payment Terms</p>
                  <p className="mt-1 whitespace-pre-line text-xs text-[#355240]">
                    {packageMeta.paymentTermsText}
                  </p>
                </div>
              )}

              {packageMeta.specialOfferNote && (
                <p className="text-xs font-medium italic text-[#526b5c]">
                  {packageMeta.specialOfferNote}
                </p>
              )}
            </Card>
          )}

          <Card className="bg-white border border-[#e1ece3] shadow-sm rounded-2xl p-6">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#0c2e1b]">Payment Details</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded-xl border border-[#e1ece3] bg-[#f9fbf9] p-3">
                <span className="text-[#526b5c] uppercase text-[10px] font-bold">Method</span>
                <p className="font-bold text-[#0c2317] mt-0.5">{invoice.paymentMethod}</p>
              </div>
              {invoice.upiId && (
                <div className="rounded-xl border border-[#e1ece3] bg-[#f9fbf9] p-3">
                  <span className="text-[#526b5c] uppercase text-[10px] font-bold">UPI ID</span>
                  <p className="font-bold text-[#0c2317] mt-0.5">{invoice.upiId}</p>
                </div>
              )}
              {invoice.transactionRef && (
                <div className="rounded-xl border border-[#e1ece3] bg-[#f9fbf9] p-3">
                  <span className="text-[#526b5c] uppercase text-[10px] font-bold">Reference</span>
                  <p className="font-bold text-[#0c2317] mt-0.5">{invoice.transactionRef}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-[#e1ece3] bg-white shadow-sm rounded-2xl p-6">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#0c2e1b]">Invoice Summary</h2>
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

            <div className="my-4 flex items-center justify-between rounded-xl bg-[#0c2e1b] px-4 py-3.5 text-[#f0c34e] shadow-md shadow-[#0c2e1b]/20">
              <span className="text-xs font-bold uppercase tracking-wider">Grand Total</span>
              <span className="text-xl font-black">{formatINR(invoice.grandTotal)}</span>
            </div>

            <Row label="Amount Paid" value={formatINR(invoice.amountPaid)} />
            <Row label="Balance Due" value={formatINR(invoice.balanceDue)} />
            <p className="mt-3 text-[11px] italic text-[#526b5c] border-t border-[#edf2ee] pt-3">{invoice.amountInWords}</p>
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
    <div className="flex items-center justify-between border-b border-[#edf2ee] py-2 text-xs last:border-0">
      <span className={highlight ? "font-bold text-[#0c2e1b]" : "text-[#526b5c]"}>
        {label}
      </span>
      <span className={`font-bold ${highlight ? "text-[#0c2e1b]" : "text-[#0c2317]"}`}>
        {value}
      </span>
    </div>
  );
}

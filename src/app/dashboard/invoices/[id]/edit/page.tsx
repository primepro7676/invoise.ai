import { notFound } from "next/navigation";
import Link from "next/link";
import { Eye, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { InvoiceForm } from "@/components/invoice/invoice-form";
import { parseInvoiceNotes } from "@/lib/validation";
import { Button } from "@/components/ui/button";

export default async function EditInvoicePage({
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

  const initial = {
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate.toISOString().slice(0, 10),
    dueDate: invoice.dueDate.toISOString().slice(0, 10),
    paymentStatus: invoice.paymentStatus,
    customerId: invoice.customerId,
    lineItems: invoice.lineItems.map((li) => ({
      categoryName: li.categoryName,
      packageName: li.packageName,
      description: li.description,
      quantity: li.quantity,
      rate: li.rate,
      isCustomPrice: li.isCustomPrice,
      discount: li.discount,
      discountType: "FLAT" as const,
      gstPercent: li.gstPercent,
    })),
    overallDiscount: packageMeta.overallDiscount,
    discountType: packageMeta.discountType,
    discountReason: packageMeta.discountReason,
    packageTitle: packageMeta.packageTitle,
    packageSubtitle: packageMeta.packageSubtitle,
    platformsIncluded: packageMeta.platformsIncluded,
    packageInclusions: packageMeta.packageInclusions,
    paymentTermsText: packageMeta.paymentTermsText,
    specialOfferNote: packageMeta.specialOfferNote,
    gstEnabled: invoice.gstEnabled,
    gstPercent: invoice.gstPercent,
    amountPaid: invoice.amountPaid,
    paymentMethod: invoice.paymentMethod,
    upiId: invoice.upiId,
    transactionRef: invoice.transactionRef,
    notes: packageMeta.internalNotes,
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-xs font-bold text-amber-300">
              {invoice.invoiceNumber}
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Edit Invoice</h1>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Customer: <strong className="text-white">{invoice.customer.companyName}</strong> · Update items, rates, discounts, or terms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/dashboard/invoices/${id}`}>
            <Button variant="secondary" size="sm" className="gap-1.5">
              <Eye className="h-3.5 w-3.5 text-amber-400" />
              <span>View Details</span>
            </Button>
          </Link>
          <Link href="/dashboard/invoices">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>All Invoices</span>
            </Button>
          </Link>
        </div>
      </div>

      <InvoiceForm mode="edit" invoiceId={id} initialValues={initial} />
    </div>
  );
}

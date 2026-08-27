import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InvoiceForm } from "@/components/invoice/invoice-form";
import { parseInvoiceNotes } from "@/lib/validation";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy-900">Edit Invoice</h1>
        <p className="text-sm text-navy-600/70">
          Update invoice details, package scope, special discounts, payment and services.
        </p>
      </div>
      <InvoiceForm mode="edit" invoiceId={id} initialValues={initial} />
    </div>
  );
}

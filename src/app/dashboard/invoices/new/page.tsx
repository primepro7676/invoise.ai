import { InvoiceForm } from "@/components/invoice/invoice-form";

export default function NewInvoicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy-900">Create Invoice</h1>
        <p className="text-sm text-navy-600/70">Fill in customer, services and payment details, then generate the PDF.</p>
      </div>
      <InvoiceForm />
    </div>
  );
}

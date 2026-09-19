import { InvoiceForm } from "@/components/invoice/invoice-form";

export default function NewInvoicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0c2317] tracking-tight">Create New Invoice</h1>
        <p className="mt-1 text-xs sm:text-sm font-medium text-[#526b5c]">Fill in customer, services and payment details, then generate the PDF.</p>
      </div>
      <InvoiceForm />
    </div>
  );
}


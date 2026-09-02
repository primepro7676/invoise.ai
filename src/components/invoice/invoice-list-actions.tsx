"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2, MessageCircle, Download } from "lucide-react";
import { useRouter } from "next/navigation";

export function InvoiceListActions({
  invoiceId,
  invoiceNumber,
  customerName,
  customerPhone,
  total,
  paid,
}: {
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  total: number;
  paid: number;
}) {
  const router = useRouter();

  async function del() {
    if (!confirm(`Delete ${invoiceNumber}? This cannot be undone.`)) return;
    const r = await fetch(`/api/invoices/${invoiceId}`, { method: "DELETE" });
    if (r.ok) router.refresh();
  }

  function wa() {
    const phone = customerPhone.replace(/[^0-9]/g, "");
    const due = Math.max(0, total - paid);
    const msg = `Hello ${customerName},\n\nInvoice ${invoiceNumber}\nTotal: ₹${total.toLocaleString(
      "en-IN",
      { minimumFractionDigits: 2 }
    )}\nPaid: ₹${paid.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    })}\nBalance Due: ₹${due.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    })}\n\nInvoice PDF: ${window.location.origin}/api/invoices/${invoiceId}/pdf`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link
        href={`/dashboard/invoices/${invoiceId}`}
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:border-amber-500/40 hover:text-amber-300 hover:bg-white/10 transition"
        title="View Details"
      >
        <Eye className="h-3.5 w-3.5" />
      </Link>

      <Link
        href={`/dashboard/invoices/${invoiceId}/edit`}
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:border-blue-500/40 hover:text-blue-300 hover:bg-white/10 transition"
        title="Edit Invoice"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Link>

      <button
        type="button"
        onClick={wa}
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-400 hover:bg-white/10 transition"
        title="Share on WhatsApp"
      >
        <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
      </button>

      <a
        href={`/api/invoices/${invoiceId}/pdf`}
        download={`${invoiceNumber}.pdf`}
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:border-amber-500/40 hover:text-amber-300 hover:bg-white/10 transition"
        title="Download PDF"
      >
        <Download className="h-3.5 w-3.5" />
      </a>

      <button
        type="button"
        onClick={del}
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:border-red-500/40 hover:text-red-400 hover:bg-white/10 transition"
        title="Delete"
      >
        <Trash2 className="h-3.5 w-3.5 text-red-400" />
      </button>
    </div>
  );
}

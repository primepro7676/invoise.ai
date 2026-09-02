"use client";

import { useState } from "react";
import { Download, Eye, Loader2, Pencil, Trash2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, Input, Label } from "@/components/ui/input";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = ["UNPAID", "PARTIALLY_PAID", "PAID", "OVERDUE"];

export function InvoiceActions({
  invoiceId,
  currentStatus,
  amountPaid = 0,
  grandTotal = 0,
  customerName = "Customer",
  invoiceNumber = "Invoice",
  customerPhone = "",
}: {
  invoiceId: string;
  currentStatus: string;
  amountPaid?: number;
  grandTotal?: number;
  customerName?: string;
  invoiceNumber?: string;
  customerPhone?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [paid, setPaid] = useState(String(amountPaid));
  const [updating, setUpdating] = useState(false);

  async function updatePayment(nextStatus = status, nextPaid = paid) {
    setUpdating(true);
    const res = await fetch(`/api/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentStatus: nextStatus,
        amountPaid: Number(nextPaid) || 0,
      }),
    });
    if (res.ok) {
      setStatus(nextStatus);
      setPaid(nextPaid);
      router.refresh();
    }
    setUpdating(false);
  }

  async function removeInvoice() {
    if (!window.confirm(`Delete ${invoiceNumber}? This cannot be undone.`)) return;
    setUpdating(true);
    const res = await fetch(`/api/invoices/${invoiceId}`, { method: "DELETE" });
    if (res.ok) router.push("/dashboard/invoices");
    else setUpdating(false);
  }

  function shareWhatsApp() {
    const balance = Math.max(0, grandTotal - Number(paid || 0));
    const phone = customerPhone.replace(/[^0-9]/g, "");
    const message = `Hello ${customerName},\n\nInvoice ${invoiceNumber}\nTotal: ₹${grandTotal.toLocaleString(
      "en-IN",
      { minimumFractionDigits: 2 }
    )}\nPaid: ₹${Number(paid || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    })}\nBalance Due: ₹${balance.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    })}\n\nPlease find your invoice here: ${window.location.origin}/api/invoices/${invoiceId}/pdf`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  const balance = Math.max(0, grandTotal - Number(paid || 0));

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div>
        <Label className="text-[10px]">Status</Label>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            updatePayment(e.target.value, paid);
          }}
          disabled={updating}
          className="w-36 h-9 text-xs"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label className="text-[10px]">Amount Paid</Label>
        <Input
          value={paid}
          onChange={(e) => setPaid(e.target.value)}
          onBlur={() => updatePayment(status, paid)}
          type="number"
          min="0"
          step="0.01"
          className="w-28 h-9 text-xs"
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs backdrop-blur-md">
        <span className="text-[10px] text-slate-400 font-medium">Balance</span>
        <br />
        <b className="text-amber-400 font-bold">
          ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </b>
      </div>

      {updating && <Loader2 className="h-4 w-4 animate-spin text-amber-400" />}

      <a href={`/dashboard/invoices/${invoiceId}/edit`}>
        <Button variant="secondary" size="sm">
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
      </a>

      <Button variant="secondary" size="sm" onClick={shareWhatsApp} title="Share on WhatsApp">
        <MessageCircle className="h-3.5 w-3.5 text-emerald-400" /> WhatsApp
      </Button>

      <a href={`/api/invoices/${invoiceId}/pdf`} target="_blank" rel="noreferrer">
        <Button variant="secondary" size="sm">
          <Eye className="h-3.5 w-3.5" /> Preview
        </Button>
      </a>

      <a href={`/api/invoices/${invoiceId}/pdf`} download={`${invoiceNumber}.pdf`}>
        <Button variant="primary" size="sm">
          <Download className="h-3.5 w-3.5" /> PDF
        </Button>
      </a>

      <Button variant="danger" size="sm" onClick={removeInvoice} disabled={updating}>
        <Trash2 className="h-3.5 w-3.5" /> Delete
      </Button>
    </div>
  );
}

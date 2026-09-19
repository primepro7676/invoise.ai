"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerSchema, type CustomerFormValues } from "@/lib/validation";
import { Plus, Search, Loader2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

interface CustomerRow {
  id: string;
  companyName: string;
  contactPerson: string | null;
  billingAddress: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
  email: string;
  gstin: string | null;
  placeOfSupply: string;
  invoiceCount: number;
}

export function CustomersClient({ initialCustomers }: { initialCustomers: CustomerRow[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    if (!q.trim()) return initialCustomers;
    const lower = q.toLowerCase();
    return initialCustomers.filter(
      (c) =>
        c.companyName.toLowerCase().includes(lower) ||
        (c.email && c.email.toLowerCase().includes(lower)) ||
        c.phone.includes(lower)
    );
  }, [q, initialCustomers]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8aa393]" />
          <Input
            className="pl-9 bg-white"
            placeholder="Search customers..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowForm(true)} className="font-bold shadow-sm gap-1.5">
          <Plus className="h-4 w-4" /> Add Customer
        </Button>
      </div>

      {showForm && (
        <AddCustomerCard
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            router.refresh();
          }}
        />
      )}

      <Card className="bg-white border border-[#e1ece3] shadow-sm rounded-2xl p-5">
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm font-semibold text-[#526b5c]">No customers found.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#e1ece3]">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#e1ece3] bg-[#f4f7f4] text-left text-[11px] font-bold uppercase tracking-wider text-[#526b5c]">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">GSTIN</th>
                  <th className="py-3 px-4">Invoices</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1ece3] bg-white">
                {filtered.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-[#f4f7f4]">
                    <td className="py-3.5 px-4 font-bold text-[#0c2317]">{c.companyName}</td>
                    <td className="py-3.5 px-4 text-[#355240]">
                      {c.email || "—"}
                      <br />
                      <span className="text-[#526b5c] font-medium">{c.phone}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#526b5c] font-medium">
                      {c.city}, {c.state}
                    </td>
                    <td className="py-3.5 px-4 text-[#0c2317] font-medium">{c.gstin || "—"}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block rounded-md border border-[#d2ded5] bg-[#eaf2ec] px-2.5 py-0.5 font-bold text-[#0c2e1b] text-[11px]">
                        {c.invoiceCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/dashboard/customers/${c.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#d2ded5] bg-white px-2.5 py-1 text-[11px] font-bold text-[#0c2e1b] hover:bg-[#eaf2ec] transition shadow-2xs"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function AddCustomerCard({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { country: "India" },
  });

  async function onSubmit(values: CustomerFormValues) {
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSubmitting(false);
    if (!res.ok) {
      setError("Failed to add customer. Please check the fields.");
      return;
    }
    onCreated();
  }

  return (
    <Card className="bg-white border border-[#e1ece3] shadow-md rounded-2xl p-6">
      <div className="mb-4 flex items-center justify-between border-b border-[#e1ece3] pb-3">
        <h2 className="text-base font-black text-[#0c2317]">Add Customer</h2>
        <button onClick={onClose} className="rounded-lg p-1 text-[#526b5c] hover:bg-[#f4f7f4]">
          <X className="h-4 w-4" />
        </button>
      </div>
      {error && <p className="mb-3 text-xs font-bold text-rose-600">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Company / Customer Name *</Label>
          <Input {...register("companyName")} className="mt-1" />
          {errors.companyName && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.companyName.message}</p>}
        </div>
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Contact Person</Label>
          <Input {...register("contactPerson")} className="mt-1" />
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Billing Address *</Label>
          <Input {...register("billingAddress")} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">City *</Label>
          <Input {...register("city")} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">State *</Label>
          <Input {...register("state")} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Pincode *</Label>
          <Input {...register("pincode")} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Country</Label>
          <Input {...register("country")} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Phone *</Label>
          <Input {...register("phone")} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Email</Label>
          <Input type="email" {...register("email")} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">GSTIN</Label>
          <Input {...register("gstin")} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Place of Supply</Label>
          <Input {...register("placeOfSupply")} className="mt-1" />
        </div>
        <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Customer
          </Button>
        </div>
      </form>
    </Card>
  );
}

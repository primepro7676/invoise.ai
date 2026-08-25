"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Search, X, Loader2 } from "lucide-react";
import { customerSchema, type CustomerFormValues } from "@/lib/validation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface CustomerRow {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  gstin: string;
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
        c.email.toLowerCase().includes(lower) ||
        c.phone.includes(lower)
    );
  }, [q, initialCustomers]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
          <Input className="pl-9" placeholder="Search customers..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Button onClick={() => setShowForm(true)}>
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

      <Card>
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-navy-600/60">No customers found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-100 text-left text-xs uppercase text-navy-600/60">
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Contact</th>
                  <th className="pb-2 pr-4">Location</th>
                  <th className="pb-2 pr-4">GSTIN</th>
                  <th className="pb-2 pr-4">Invoices</th>
                  <th className="pb-2 pr-4" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-brand-50 last:border-0 hover:bg-brand-50/40">
                    <td className="py-2.5 pr-4 font-medium text-navy-900">{c.companyName}</td>
                    <td className="py-2.5 pr-4 text-navy-600/80">
                      {c.email}
                      <br />
                      {c.phone}
                    </td>
                    <td className="py-2.5 pr-4 text-navy-600/80">
                      {c.city}, {c.state}
                    </td>
                    <td className="py-2.5 pr-4 text-navy-600/80">{c.gstin || "—"}</td>
                    <td className="py-2.5 pr-4 text-navy-600/80">{c.invoiceCount}</td>
                    <td className="py-2.5 pr-4 text-right">
                      <Link href={`/dashboard/customers/${c.id}`} className="text-xs font-medium text-brand-600 hover:underline">
                        View →
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
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-navy-900">Add Customer</h2>
        <button onClick={onClose} className="rounded p-1 text-navy-500 hover:bg-brand-50">
          <X className="h-4 w-4" />
        </button>
      </div>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Company / Customer Name</Label>
          <Input {...register("companyName")} />
          {errors.companyName && <p className="mt-1 text-xs text-red-600">{errors.companyName.message}</p>}
        </div>
        <div>
          <Label>Contact Person</Label>
          <Input {...register("contactPerson")} />
        </div>
        <div className="sm:col-span-2">
          <Label>Billing Address</Label>
          <Input {...register("billingAddress")} />
        </div>
        <div>
          <Label>City</Label>
          <Input {...register("city")} />
        </div>
        <div>
          <Label>State</Label>
          <Input {...register("state")} />
        </div>
        <div>
          <Label>Pincode</Label>
          <Input {...register("pincode")} />
        </div>
        <div>
          <Label>Country</Label>
          <Input {...register("country")} />
        </div>
        <div>
          <Label>Phone</Label>
          <Input {...register("phone")} />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" {...register("email")} />
        </div>
        <div>
          <Label>GSTIN</Label>
          <Input {...register("gstin")} />
        </div>
        <div>
          <Label>Place of Supply</Label>
          <Input {...register("placeOfSupply")} />
        </div>
        <div className="sm:col-span-2 flex justify-end gap-3">
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

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input, Select } from "@/components/ui/input";

export function InvoiceFilters({ defaultQuery, defaultStatus }: { defaultQuery: string; defaultStatus: string }) {
  const router = useRouter();
  const [q, setQ] = useState(defaultQuery);
  const [status, setStatus] = useState(defaultStatus);

  function apply(nextQ: string, nextStatus: string) {
    const params = new URLSearchParams();
    if (nextQ) params.set("q", nextQ);
    if (nextStatus) params.set("status", nextStatus);
    router.push(`/dashboard/invoices?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
        <Input
          className="pl-9"
          placeholder="Search by invoice number or customer..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && apply(q, status)}
        />
      </div>
      <Select
        className="sm:w-56"
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          apply(q, e.target.value);
        }}
      >
        <option value="">All statuses</option>
        <option value="UNPAID">Unpaid</option>
        <option value="PARTIALLY_PAID">Partially Paid</option>
        <option value="PAID">Paid</option>
        <option value="OVERDUE">Overdue</option>
      </Select>
    </div>
  );
}

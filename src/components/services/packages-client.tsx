"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { formatINR } from "@/lib/calculations";

interface PackageRow {
  id: string;
  name: string;
  price: number;
  description: string;
  isCustom: boolean;
}
interface CategoryGroup {
  id: string;
  name: string;
  packages: PackageRow[];
}

export function PackagesClient({ categories }: { categories: CategoryGroup[] }) {
  const router = useRouter();
  const [formFor, setFormFor] = useState<{ categoryId: string; pkg: PackageRow | null } | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this package?")) return;
    await fetch(`/api/packages/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {categories.map((cat) => (
        <Card key={cat.id}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-navy-900">{cat.name}</h2>
            <Button size="sm" onClick={() => setFormFor({ categoryId: cat.id, pkg: null })}>
              <Plus className="h-3.5 w-3.5" /> Add Package
            </Button>
          </div>

          {formFor?.categoryId === cat.id && (
            <PackageForm
              categoryId={cat.id}
              initial={formFor.pkg}
              onClose={() => setFormFor(null)}
              onSaved={() => {
                setFormFor(null);
                router.refresh();
              }}
            />
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cat.packages.map((pkg) => (
              <div key={pkg.id} className="rounded-lg border border-brand-100 bg-brand-50/30 p-3">
                <div className="mb-1 flex items-start justify-between">
                  <p className="text-sm font-semibold text-navy-900">{pkg.name}</p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setFormFor({ categoryId: cat.id, pkg })}
                      className="rounded p-1 text-navy-500 hover:bg-brand-100"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button onClick={() => handleDelete(pkg.id)} className="rounded p-1 text-red-500 hover:bg-red-50">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <p className="text-sm font-medium text-brand-700">
                  {pkg.isCustom ? "Custom Price" : formatINR(pkg.price)}
                </p>
                {pkg.description && <p className="mt-1 text-xs text-navy-600/60">{pkg.description}</p>}
              </div>
            ))}
            {cat.packages.length === 0 && (
              <p className="text-sm text-navy-600/60">No packages yet for this category.</p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

function PackageForm({
  categoryId,
  initial,
  onClose,
  onSaved,
}: {
  categoryId: string;
  initial: PackageRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [description, setDescription] = useState(initial?.description || "");
  const [isCustom, setIsCustom] = useState(initial?.isCustom || false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const url = initial ? `/api/packages/${initial.id}` : "/api/packages";
    const method = initial ? "PATCH" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, name, price: isCustom ? 0 : price, description, isCustom }),
    });
    setSubmitting(false);
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 rounded-lg border border-brand-200 bg-white p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label>Package Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label>Price (₹)</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={price}
            disabled={isCustom}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm text-navy-700">
        <input type="checkbox" checked={isCustom} onChange={(e) => setIsCustom(e.target.checked)} />
        This is a &quot;Custom Price&quot; option (admin enters price manually on each invoice)
      </label>
      <div className="mt-4 flex justify-end gap-3">
        <Button type="button" variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Package
        </Button>
      </div>
    </form>
  );
}

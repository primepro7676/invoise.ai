"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2, Loader2, Layers, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

interface CategoryRow {
  id: string;
  name: string;
  description: string;
  packageCount: number;
}

export function ServicesClient({ initialCategories }: { initialCategories: CategoryRow[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this service category? Existing invoices are not affected.")) return;
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="gap-2 font-bold shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Service Category
        </Button>
      </div>

      {showForm && (
        <CategoryForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            router.refresh();
          }}
        />
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {initialCategories.map((cat) => (
          <Card key={cat.id} className="bg-white border border-[#e1ece3] shadow-sm rounded-2xl p-5 flex flex-col justify-between hover:border-[#133b24]/30 transition-all">
            <div>
              <div className="mb-3.5 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0c2e1b]/10 border border-[#0c2e1b]/20 text-[#0c2e1b]">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditing(cat);
                      setShowForm(true);
                    }}
                    className="rounded-lg p-1.5 text-[#526b5c] hover:bg-[#f4f7f4] hover:text-[#0c2317] transition"
                    title="Edit category"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 transition"
                    title="Delete category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-base font-black text-[#0c2317]">{cat.name}</h3>
              {cat.description && <p className="mt-1.5 text-xs text-[#526b5c] leading-relaxed">{cat.description}</p>}
            </div>

            <div className="mt-5 pt-3.5 border-t border-[#e1ece3] flex items-center justify-between">
              <span className="text-xs font-bold text-[#0c2e1b] bg-[#f4f7f4] px-2.5 py-1 rounded-full border border-[#e1ece3]">
                {cat.packageCount} package(s)
              </span>
              <Link
                href="/dashboard/packages"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0c2e1b] hover:text-[#e5ba55] transition-colors"
              >
                Manage packages <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CategoryForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: CategoryRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const url = initial ? `/api/services/${initial.id}` : "/api/services";
    const method = initial ? "PATCH" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    setSubmitting(false);
    onSaved();
  }

  return (
    <Card className="bg-white border border-[#e1ece3] shadow-md rounded-2xl p-6">
      <h2 className="mb-4 text-base font-black text-[#0c2317]">
        {initial ? "Edit Service Category" : "Add Service Category"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Category Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1.5" />
        </div>
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c]">Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Category
          </Button>
        </div>
      </form>
    </Card>
  );
}


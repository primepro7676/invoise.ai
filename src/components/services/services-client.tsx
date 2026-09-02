"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2, Loader2, Layers } from "lucide-react";
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {initialCategories.map((cat) => (
          <Card key={cat.id}>
            <div className="mb-3 flex items-start justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Layers className="h-4 w-4" />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setEditing(cat);
                    setShowForm(true);
                  }}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/15 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <h3 className="text-base font-bold text-white">{cat.name}</h3>
            {cat.description && <p className="mt-1 text-xs text-slate-400">{cat.description}</p>}
            <p className="mt-3 text-xs text-amber-300 font-semibold">{cat.packageCount} package(s)</p>
            <Link
              href="/dashboard/packages"
              className="mt-2 inline-block text-xs font-semibold text-amber-400 hover:text-amber-300 hover:underline"
            >
              Manage packages →
            </Link>
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
    <Card>
      <h2 className="mb-4 text-base font-bold text-white">
        {initial ? "Edit Service Category" : "Add Service Category"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Category Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </Button>
        </div>
      </form>
    </Card>
  );
}

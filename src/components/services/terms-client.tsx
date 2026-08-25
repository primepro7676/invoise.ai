"use client";

import { useState } from "react";
import { Loader2, Save, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea, Label } from "@/components/ui/input";

interface CategoryTerms {
  id: string;
  name: string;
  content: string;
}

export function TermsClient({ categories, generalTerms }: { categories: CategoryTerms[]; generalTerms: string }) {
  return (
    <div className="space-y-6">
      {categories.map((cat) => (
        <TermsEditor key={cat.id} title={cat.name} initialContent={cat.content} saveUrl={`/api/terms/${cat.id}`} />
      ))}
      <TermsEditor title="General Terms (always included)" initialContent={generalTerms} saveUrl="/api/terms/general" />
    </div>
  );
}

function TermsEditor({ title, initialContent, saveUrl }: { title: string; initialContent: string; saveUrl: string }) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch(saveUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-navy-900">{title}</h2>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
          {saved ? "Saved" : "Save"}
        </Button>
      </div>
      <Label>One clause per line</Label>
      <Textarea rows={6} className="min-h-[150px]" value={content} onChange={(e) => setContent(e.target.value)} />
    </Card>
  );
}

"use client";

import { useState } from "react";
import { Loader2, Save, Check, FileText } from "lucide-react";
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
      <TermsEditor title="General Terms (Always included on Page 2)" initialContent={generalTerms} saveUrl="/api/terms/general" isGeneral />
    </div>
  );
}

function TermsEditor({
  title,
  initialContent,
  saveUrl,
  isGeneral = false,
}: {
  title: string;
  initialContent: string;
  saveUrl: string;
  isGeneral?: boolean;
}) {
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
    <Card className={`bg-white border shadow-sm rounded-2xl p-6 ${isGeneral ? "border-[#0c2e1b]/30 ring-1 ring-[#0c2e1b]/10" : "border-[#e1ece3]"}`}>
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0c2e1b]/10 border border-[#0c2e1b]/20 text-[#0c2e1b]">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-black text-[#0c2317]">{title}</h2>
            {isGeneral && <span className="text-[10px] font-bold uppercase tracking-wider text-[#e5ba55] bg-[#0c2e1b] px-2 py-0.5 rounded-full">Default Section</span>}
          </div>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving} className="font-bold text-xs gap-1.5 shadow-sm">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Save className="h-3.5 w-3.5" />}
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>
      <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c] mb-1.5 block">One clause per line</Label>
      <Textarea rows={6} className="min-h-[150px] font-mono text-xs leading-relaxed" value={content} onChange={(e) => setContent(e.target.value)} />
    </Card>
  );
}


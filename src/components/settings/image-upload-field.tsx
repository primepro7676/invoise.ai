"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Loader2, ImageIcon } from "lucide-react";
import { Label } from "@/components/ui/input";

export function ImageUploadField({
  label,
  folder,
  currentUrl,
  onUploaded,
}: {
  label: string;
  folder: string;
  currentUrl: string;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setError(data.error || "Upload failed");
      return;
    }
    setPreview(data.url);
    onUploaded(data.url);
  }

  return (
    <div>
      <Label className="text-xs font-bold uppercase tracking-wider text-[#526b5c] mb-1.5 block">{label}</Label>
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-28 items-center justify-center overflow-hidden rounded-xl border border-[#e1ece3] bg-[#f4f7f4] p-1 shadow-inner">
          {preview ? (
            <Image src={preview} alt={label} width={112} height={64} className="h-full w-full object-contain" unoptimized />
          ) : (
            <div className="flex flex-col items-center justify-center text-[#8aa393]">
              <ImageIcon className="h-5 w-5 mb-0.5 opacity-50" />
              <span className="text-[10px] font-semibold">No image</span>
            </div>
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="btn-secondary text-xs font-bold py-2 px-3 gap-1.5"
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {uploading ? "Uploading..." : "Upload New"}
          </button>
          {error && <p className="mt-1 text-xs font-semibold text-rose-600">{error}</p>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
    </div>
  );
}


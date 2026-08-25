"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Check } from "lucide-react";
import { companySettingsSchema, type CompanySettingsFormValues } from "@/lib/validation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ImageUploadField } from "@/components/settings/image-upload-field";

interface SettingsData extends CompanySettingsFormValues {
  primeproLogoUrl: string;
  fueloLogoUrl: string;
  qrCodeUrl: string;
  signatureUrl: string;
}

export function SettingsClient({ settings }: { settings: SettingsData }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [assets, setAssets] = useState({
    primeproLogoUrl: settings.primeproLogoUrl,
    fueloLogoUrl: settings.fueloLogoUrl,
    qrCodeUrl: settings.qrCodeUrl,
    signatureUrl: settings.signatureUrl,
  });

  const { register, handleSubmit } = useForm<CompanySettingsFormValues>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: settings,
  });

  async function onSubmit(values: CompanySettingsFormValues) {
    setSaving(true);
    setSaved(false);
    await Promise.all([
      fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }),
      fetch("/api/settings/assets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assets),
      }),
    ]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-base font-semibold text-navy-900">PrimePro Technologies AI LLC</h2>
          <div className="space-y-4">
            <ImageUploadField
              label="PrimePro Logo"
              folder="logos"
              currentUrl={assets.primeproLogoUrl}
              onUploaded={(url) => setAssets((a) => ({ ...a, primeproLogoUrl: url }))}
            />
            <Field label="Company Name" {...register("primeproName")} />
            <Field label="Tagline (e.g. USA Headquarters)" {...register("primeproTagline")} />
            <Field label="Address" {...register("primeproAddress")} />
            <Field label="Registration" {...register("primeproRegistration")} />
            <Field label="EIN" {...register("primeproEIN")} />
            <Field label="Phone" {...register("primeproPhone")} />
            <Field label="WhatsApp" {...register("primeproWhatsapp")} />
            <Field label="Email" type="email" {...register("primeproEmail")} />
            <Field label="LinkedIn URL" {...register("primeproLinkedin")} />
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-base font-semibold text-navy-900">Fuelo Technologies OPC Pvt Ltd</h2>
          <div className="space-y-4">
            <ImageUploadField
              label="Fuelo Logo"
              folder="logos"
              currentUrl={assets.fueloLogoUrl}
              onUploaded={(url) => setAssets((a) => ({ ...a, fueloLogoUrl: url }))}
            />
            <Field label="Company Name" {...register("fueloName")} />
            <Field label="Tagline (e.g. India Office)" {...register("fueloTagline")} />
            <Field label="CIN" {...register("fueloCIN")} />
            <Field label="GSTIN" {...register("fueloGSTIN")} />
            <Field label="Address" {...register("fueloAddress")} />
            <Field label="Phone" {...register("fueloPhone")} />
            <Field label="WhatsApp" {...register("fueloWhatsapp")} />
            <Field label="Email" type="email" {...register("fueloEmail")} />
            <Field label="LinkedIn URL" {...register("fueloLinkedin")} />
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-base font-semibold text-navy-900">Payment & Signature</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Default UPI ID" {...register("upiId")} />
          <Field label="Default GST %" type="number" step="0.01" {...register("defaultGstPercent")} />
          <Field label="Signature Line 1" {...register("signatoryLine1")} />
          <Field label="Signature Line 2" {...register("signatoryLine2")} />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ImageUploadField
            label="Payment QR Code"
            folder="qr"
            currentUrl={assets.qrCodeUrl}
            onUploaded={(url) => setAssets((a) => ({ ...a, qrCodeUrl: url }))}
          />
          <ImageUploadField
            label="Authorized Signature"
            folder="signatures"
            currentUrl={assets.signatureUrl}
            onUploaded={(url) => setAssets((a) => ({ ...a, signatureUrl: url }))}
          />
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-base font-semibold text-navy-900">Footer Note</h2>
        <Field label="Shown at the bottom of every PDF page" {...register("footerNote")} />
      </Card>

      <div className="flex justify-end pb-8">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? "Saved" : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}

const Field = React.forwardRef<
  HTMLInputElement,
  { label: string } & React.InputHTMLAttributes<HTMLInputElement>
>(({ label, ...props }, ref) => (
  <div>
    <Label>{label}</Label>
    <Input ref={ref} {...props} />
  </div>
));
Field.displayName = "Field";

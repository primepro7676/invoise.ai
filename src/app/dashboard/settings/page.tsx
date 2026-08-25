import { prisma } from "@/lib/prisma";
import { SettingsClient } from "@/components/settings/settings-client";

export default async function SettingsPage() {
  const settings = await prisma.companySettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy-900">Company Settings</h1>
        <p className="text-sm text-navy-600/70">
          Edit the PrimePro & Fuelo details, logos, payment QR and signature shown on every invoice PDF.
        </p>
      </div>
      <SettingsClient settings={settings} />
    </div>
  );
}

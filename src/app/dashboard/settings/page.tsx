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
        <h1 className="text-2xl sm:text-3xl font-black text-[#0c2317] tracking-tight">Company Settings</h1>
        <p className="mt-1 text-xs sm:text-sm font-medium text-[#526b5c]">
          Edit the PrimePro & Fuelo details, logos, payment QR and signature shown on every invoice PDF.
        </p>
      </div>
      <SettingsClient settings={settings} />
    </div>
  );
}


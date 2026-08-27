import { prisma } from "@/lib/prisma";
import { PackagesClient } from "@/components/services/packages-client";
import type { PackageBundleDTO } from "@/lib/types";
import { ensurePackageBundleTable } from "@/lib/ensure-db";

export const dynamic = "force-dynamic";

export default async function PackagesPage() {
  await ensurePackageBundleTable();

  let categories: any[] = [];
  let bundles: any[] = [];

  try {
    categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      include: { packages: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    });
  } catch (err) {
    console.error("Failed to fetch service categories:", err);
    categories = [];
  }

  try {
    bundles = await prisma.packageBundle.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch (err) {
    console.error("Failed to fetch package bundles:", err);
    bundles = [];
  }

  const initialBundles: PackageBundleDTO[] = bundles.map((b) => {
    let items = [];
    try {
      items = JSON.parse(b.items);
    } catch {
      items = [];
    }
    return {
      id: b.id,
      name: b.name,
      subtitle: b.subtitle,
      tier: b.tier,
      items,
      totalPrice: b.totalPrice,
      discountPrice: b.discountPrice,
      finalPrice: b.finalPrice,
      platformsIncluded: b.platformsIncluded,
      deliverables: b.deliverables,
      paymentTerms: b.paymentTerms,
      specialNote: b.specialNote,
      sortOrder: b.sortOrder,
      isActive: b.isActive,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy-900">Packages & Pricing</h1>
        <p className="text-sm text-navy-600/70">
          Create predefined main package combos (with multiple included services, tiers & discounts) and manage individual service pricing.
        </p>
      </div>
      <PackagesClient
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          packages: (c.packages || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            description: p.description,
            isCustom: p.isCustom,
            categoryId: p.categoryId,
          })),
        }))}
        initialBundles={initialBundles}
      />
    </div>
  );
}

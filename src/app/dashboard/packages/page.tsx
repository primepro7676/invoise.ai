import { prisma } from "@/lib/prisma";
import { PackagesClient } from "@/components/services/packages-client";

interface PackageRow {
  id: string;
  name: string;
  price: number;
  description: string;
  isCustom: boolean;
}
interface CategoryRow {
  id: string;
  name: string;
  packages: PackageRow[];
}

export default async function PackagesPage() {
  const categories: CategoryRow[] = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    include: { packages: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy-900">Packages & Pricing</h1>
        <p className="text-sm text-navy-600/70">Add, edit or remove packages and prices for each service.</p>
      </div>
      <PackagesClient
        categories={categories.map((c: CategoryRow) => ({
          id: c.id,
          name: c.name,
          packages: c.packages.map((p: PackageRow) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            description: p.description,
            isCustom: p.isCustom,
          })),
        }))}
      />
    </div>
  );
}

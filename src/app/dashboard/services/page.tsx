import { prisma } from "@/lib/prisma";
import { ServicesClient } from "@/components/services/services-client";

interface CategoryRow {
  id: string;
  name: string;
  description: string;
  packages: unknown[];
}

export default async function ServicesPage() {
  const categories: CategoryRow[] = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    include: { packages: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy-900">Services</h1>
        <p className="text-sm text-navy-600/70">Manage service categories. Packages & pricing are managed separately.</p>
      </div>
      <ServicesClient
        initialCategories={categories.map((c: CategoryRow) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          packageCount: c.packages.length,
        }))}
      />
    </div>
  );
}

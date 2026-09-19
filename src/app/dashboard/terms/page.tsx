import { prisma } from "@/lib/prisma";
import { TermsClient } from "@/components/services/terms-client";

interface CategoryRow {
  id: string;
  name: string;
  terms: { content: string } | null;
}

export default async function TermsPage() {
  const categories: CategoryRow[] = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    include: { terms: true },
    orderBy: { sortOrder: "asc" },
  });
  const generalTerms = await prisma.generalTerms.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0c2317] tracking-tight">Terms & Conditions</h1>
        <p className="mt-1 text-xs sm:text-sm font-medium text-[#526b5c]">
          Edit the Page 2 terms shown on the invoice PDF. Only terms for selected services are combined per invoice.
        </p>
      </div>
      <TermsClient
        categories={categories.map((c: CategoryRow) => ({ id: c.id, name: c.name, content: c.terms?.content || "" }))}
        generalTerms={generalTerms.content}
      />
    </div>
  );
}


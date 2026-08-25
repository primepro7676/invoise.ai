import { prisma } from "@/lib/prisma";
import { CustomersClient } from "@/components/customers/customers-client";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { invoices: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy-900">Customers</h1>
        <p className="text-sm text-navy-600/70">{customers.length} total</p>
      </div>
      <CustomersClient
        initialCustomers={customers.map(
          (c: {
            id: string;
            companyName: string;
           email: string | null; 
            phone: string;
            city: string;
            state: string;
            gstin: string;
            _count: { invoices: number };
          }) => ({
            id: c.id,
            companyName: c.companyName,
          email: c.email ?? "",  
            phone: c.phone,
            city: c.city,
            state: c.state,
            gstin: c.gstin,
            invoiceCount: c._count.invoices,
          })
        )}
      />
    </div>
  );
}

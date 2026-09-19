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
        <h1 className="text-2xl sm:text-3xl font-black text-[#0c2317] tracking-tight">Customers</h1>
        <p className="mt-1 text-xs sm:text-sm font-medium text-[#526b5c]">{customers.length} total customer accounts</p>
      </div>
      <CustomersClient
        initialCustomers={customers.map((c) => ({
          id: c.id,
          companyName: c.companyName,
          contactPerson: c.contactPerson,
          billingAddress: c.billingAddress,
          city: c.city,
          state: c.state,
          pincode: c.pincode,
          country: c.country,
          phone: c.phone,
          email: c.email ?? "",
          gstin: c.gstin,
          placeOfSupply: c.placeOfSupply,
          invoiceCount: c._count.invoices,
        }))}
      />
    </div>
  );
}

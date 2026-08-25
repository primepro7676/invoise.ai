import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR, formatDate } from "@/lib/calculations";
import { InvoiceFilters } from "@/components/invoice/invoice-filters";
import { InvoiceListActions } from "@/components/invoice/invoice-list-actions";

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q, status } = await searchParams;
  const invoices = await prisma.invoice.findMany({
    where: { AND: [status ? { paymentStatus: status as never } : {}, q ? { OR: [{ invoiceNumber: { contains: q } }, { customer: { companyName: { contains: q } } }] } : {}] },
    include: { customer: true }, orderBy: { createdAt: "desc" },
  });
  const totals = invoices.reduce((a, i) => ({ total: a.total + i.grandTotal, paid: a.paid + i.amountPaid, due: a.due + i.balanceDue }), { total: 0, paid: 0, due: 0 });
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold text-navy-900">Invoices</h1><p className="text-sm text-navy-600/70">{invoices.length} total</p></div><Link href="/dashboard/invoices/new"><Button><Plus className="h-4 w-4" /> Create Invoice</Button></Link></div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><Mini label="Total Amount" value={formatINR(totals.total)} /><Mini label="Amount Received" value={formatINR(totals.paid)} /><Mini label="Balance Due" value={formatINR(totals.due)} /></div>
      <InvoiceFilters defaultQuery={q || ""} defaultStatus={status || ""} />
      <Card>{invoices.length === 0 ? <p className="py-10 text-center text-sm text-navy-600/60">No invoices found.</p> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-brand-100 text-left text-xs uppercase text-navy-600/60"><th className="pb-2 pr-4">Invoice #</th><th className="pb-2 pr-4">Customer</th><th className="pb-2 pr-4">Date</th><th className="pb-2 pr-4">Total</th><th className="pb-2 pr-4">Paid</th><th className="pb-2 pr-4">Balance</th><th className="pb-2 pr-4">Status</th><th className="pb-2 pr-4">Actions</th></tr></thead><tbody>{invoices.map((inv) => <tr key={inv.id} className="border-b border-brand-50 last:border-0 hover:bg-brand-50/40"><td className="py-3 pr-4 font-medium text-brand-700"><Link href={`/dashboard/invoices/${inv.id}`} className="hover:underline">{inv.invoiceNumber}</Link></td><td className="py-3 pr-4 text-navy-800">{inv.customer.companyName}</td><td className="py-3 pr-4 text-navy-600/70">{formatDate(inv.invoiceDate)}</td><td className="py-3 pr-4 font-medium">{formatINR(inv.grandTotal)}</td><td className="py-3 pr-4">{formatINR(inv.amountPaid)}</td><td className="py-3 pr-4 font-medium text-red-600">{formatINR(inv.balanceDue)}</td><td className="py-3 pr-4"><StatusBadge status={inv.paymentStatus} /></td><td className="py-3 pr-4"><InvoiceListActions invoiceId={inv.id} invoiceNumber={inv.invoiceNumber} customerName={inv.customer.companyName} customerPhone={inv.customer.phone} total={inv.grandTotal} paid={inv.amountPaid} /></td></tr>)}</tbody></table></div>}</Card>
    </div>
  );
}
function Mini({label,value}:{label:string;value:string}){return <Card className="py-4"><p className="text-xs text-navy-600/60">{label}</p><p className="text-lg font-semibold text-navy-900">{value}</p></Card>}
function StatusBadge({ status }: { status: string }) { const styles: Record<string,string>={PAID:"bg-brand-100 text-brand-700",UNPAID:"bg-amber-100 text-amber-700",PARTIALLY_PAID:"bg-blue-100 text-blue-700",OVERDUE:"bg-red-100 text-red-700"}; return <span className={`badge ${styles[status]||"bg-gray-100 text-gray-700"}`}>{status.replace("_"," ")}</span>; }

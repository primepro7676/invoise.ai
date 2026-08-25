"use client";
import Link from "next/link";
import { Eye, Pencil, Trash2, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
export function InvoiceListActions({invoiceId,invoiceNumber,customerName,customerPhone,total,paid}:{invoiceId:string;invoiceNumber:string;customerName:string;customerPhone:string;total:number;paid:number}){
 const router=useRouter();
 async function del(){if(!confirm(`Delete ${invoiceNumber}? This cannot be undone.`))return; const r=await fetch(`/api/invoices/${invoiceId}`,{method:"DELETE"}); if(r.ok)router.refresh();}
 function wa(){const phone=customerPhone.replace(/[^0-9]/g,""); const due=Math.max(0,total-paid); const msg=`Hello ${customerName},\n\nInvoice ${invoiceNumber}\nTotal: ₹${total.toLocaleString("en-IN",{minimumFractionDigits:2})}\nPaid: ₹${paid.toLocaleString("en-IN",{minimumFractionDigits:2})}\nBalance Due: ₹${due.toLocaleString("en-IN",{minimumFractionDigits:2})}\n\nInvoice PDF: ${window.location.origin}/api/invoices/${invoiceId}/pdf`; window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,"_blank");}
 return <div className="flex items-center gap-1"><Link href={`/dashboard/invoices/${invoiceId}`}><Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View"><Eye className="h-4 w-4"/></Button></Link><Link href={`/dashboard/invoices/${invoiceId}/edit`}><Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit"><Pencil className="h-4 w-4"/></Button></Link><Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="WhatsApp" onClick={wa}><MessageCircle className="h-4 w-4 text-green-600"/></Button><Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Delete" onClick={del}><Trash2 className="h-4 w-4 text-red-600"/></Button></div>
}

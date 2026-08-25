import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { genInvoiceNumber } from "@/lib/utils";

export async function GET() {
  const count = await prisma.invoice.count();
  let seq = count + 1;
  let candidate = genInvoiceNumber(seq);

  // Guard against collisions if invoices were deleted/renumbered manually.
  while (await prisma.invoice.findUnique({ where: { invoiceNumber: candidate } })) {
    seq += 1;
    candidate = genInvoiceNumber(seq);
  }

  return NextResponse.json({ invoiceNumber: candidate });
}

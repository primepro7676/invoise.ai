import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { invoiceSchema } from "@/lib/validation";
import { computeInvoiceTotals, numberToWordsINR } from "@/lib/calculations";
import { z } from "zod";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, lineItems: { orderBy: { sortOrder: "asc" } } },
  });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(invoice);
}

const patchSchema = z.object({
  paymentStatus: z.enum(["UNPAID", "PARTIALLY_PAID", "PAID", "OVERDUE"]).optional(),
  amountPaid: z.coerce.number().min(0).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const body = await req.json();

  // Full invoice edit
  if (body?.mode === "edit") {
    const parsed = invoiceSchema.safeParse(body.data);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const data = parsed.data;
    if (!data.customerId) return NextResponse.json({ error: "Editing an invoice requires an existing customer." }, { status: 400 });

    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const duplicate = await prisma.invoice.findFirst({
      where: { invoiceNumber: data.invoiceNumber, NOT: { id } },
    });
    if (duplicate) return NextResponse.json({ error: "Invoice number already exists" }, { status: 409 });

    const totals = computeInvoiceTotals({
      lineItems: data.lineItems.map((li) => ({
        quantity: li.quantity,
        rate: li.rate,
        discount: li.discount,
        gstPercent: data.gstEnabled ? li.gstPercent : 0,
      })),
      gstEnabled: data.gstEnabled,
      amountPaid: data.amountPaid,
    });

    const updated = await prisma.$transaction(async (tx) => {
      await tx.invoiceLineItem.deleteMany({ where: { invoiceId: id } });
      return tx.invoice.update({
        where: { id },
        data: {
          invoiceNumber: data.invoiceNumber,
          invoiceDate: new Date(data.invoiceDate),
          dueDate: new Date(data.dueDate),
          paymentStatus: data.paymentStatus,
          customerId: data.customerId,
          gstEnabled: data.gstEnabled,
          gstPercent: data.gstPercent,
          subtotal: totals.subtotal,
          discountAmount: totals.discountAmount,
          taxableAmount: totals.taxableAmount,
          gstAmount: totals.gstAmount,
          grandTotal: totals.grandTotal,
          amountPaid: totals.amountPaid,
          balanceDue: totals.balanceDue,
          amountInWords: numberToWordsINR(totals.grandTotal),
          paymentMethod: data.paymentMethod,
          upiId: data.upiId,
          transactionRef: data.transactionRef,
          notes: data.notes,
          selectedCategoryIds: Array.from(new Set(data.lineItems.map((li) => li.categoryName))).join(","),
          lineItems: {
            create: data.lineItems.map((li, idx) => {
              const base = li.quantity * li.rate - li.discount;
              const gst = data.gstEnabled ? (base * li.gstPercent) / 100 : 0;
              return {
                categoryName: li.categoryName,
                packageName: li.packageName,
                description: li.description,
                quantity: li.quantity,
                rate: li.rate,
                isCustomPrice: li.isCustomPrice,
                discount: li.discount,
                gstPercent: data.gstEnabled ? li.gstPercent : 0,
                total: Math.round((base + gst + Number.EPSILON) * 100) / 100,
                sortOrder: idx,
              };
            }),
          },
        },
        include: { customer: true, lineItems: true },
      });
    });
    return NextResponse.json(updated);
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const amountPaid = Math.min(parsed.data.amountPaid ?? invoice.amountPaid, invoice.grandTotal);
  const balanceDue = Math.max(0, Math.round((invoice.grandTotal - amountPaid + Number.EPSILON) * 100) / 100);
  const paymentStatus = parsed.data.paymentStatus ?? (amountPaid <= 0 ? "UNPAID" : balanceDue <= 0 ? "PAID" : "PARTIALLY_PAID");

  const updated = await prisma.invoice.update({
    where: { id },
    data: { paymentStatus, amountPaid, balanceDue },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const existing = await prisma.invoice.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.invoice.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
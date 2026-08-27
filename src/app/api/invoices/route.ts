import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { invoiceSchema } from "@/lib/validation";
import { computeInvoiceTotals, numberToWordsINR } from "@/lib/calculations";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const status = req.nextUrl.searchParams.get("status");

  const invoices = await prisma.invoice.findMany({
    where: {
      AND: [
        status ? { paymentStatus: status as never } : {},
        q
          ? {
              OR: [
                { invoiceNumber: { contains: q } },
                { customer: { companyName: { contains: q } } },
              ],
            }
          : {},
      ],
    },
    include: { customer: true, lineItems: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  if (!data.customerId && !data.newCustomer) {
    return NextResponse.json({ error: "customerId or newCustomer is required" }, { status: 400 });
  }

  const existing = await prisma.invoice.findUnique({ where: { invoiceNumber: data.invoiceNumber } });
  if (existing) {
    return NextResponse.json({ error: "Invoice number already exists" }, { status: 409 });
  }

  let customerId = data.customerId;
  if (!customerId && data.newCustomer) {
    const customer = await prisma.customer.create({ data: data.newCustomer });
    customerId = customer.id;
  }

  const itemsForCalc = data.lineItems.map((li) => ({
    quantity: li.quantity,
    rate: li.rate,
    discount: li.discount,
    gstPercent: data.gstEnabled ? li.gstPercent : 0,
  }));

  const totals = computeInvoiceTotals({
    lineItems: itemsForCalc,
    gstEnabled: data.gstEnabled,
    amountPaid: data.amountPaid,
  });

  const selectedCategoryIds = Array.from(new Set(data.lineItems.map((li) => li.categoryName))).join(",");

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: data.invoiceNumber,
      invoiceDate: new Date(data.invoiceDate),
      dueDate: new Date(data.dueDate),
      paymentStatus: data.paymentStatus,
      customerId: customerId!,
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
      selectedCategoryIds,
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

  return NextResponse.json(invoice, { status: 201 });
}
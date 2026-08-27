import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { InvoiceDocument } from "@/lib/pdf/InvoiceDocument";
import React from "react";

export const runtime = "nodejs";

function toAbsolute(url: string | null | undefined, origin: string) {
  if (!url) return url ?? "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${origin}${url.startsWith("/") ? url : `/${url}`}`;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const origin = req.nextUrl.origin;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true, lineItems: { orderBy: { sortOrder: "asc" } } },
  });
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const settings = await prisma.companySettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  const generalTermsRow = await prisma.generalTerms.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  const selectedCategoryNames = Array.from(
    new Set(invoice.lineItems.map((li) => li.categoryName))
  );
  const categories = await prisma.serviceCategory.findMany({
    where: { name: { in: selectedCategoryNames } },
    include: { terms: true },
  });

  const termsSections = categories
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({
      title: c.name,
      lines: (c.terms?.content || "").split("\n").filter(Boolean),
    }));

  const doc = React.createElement(InvoiceDocument, {
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate.toISOString(),
    dueDate: invoice.dueDate.toISOString(),
    paymentStatus: invoice.paymentStatus,
    settings: {
      primeproName: settings.primeproName,
      primeproTagline: settings.primeproTagline,
      primeproAddress: settings.primeproAddress,
      primeproRegistration: settings.primeproRegistration,
      primeproEIN: settings.primeproEIN,
      primeproPhone: settings.primeproPhone,
      primeproWhatsapp: settings.primeproWhatsapp,
      primeproEmail: settings.primeproEmail,
      primeproLogoUrl: toAbsolute(settings.primeproLogoUrl, origin),
      fueloName: settings.fueloName,
      fueloTagline: settings.fueloTagline,
      fueloCIN: settings.fueloCIN,
      fueloGSTIN: settings.fueloGSTIN,
      fueloAddress: settings.fueloAddress,
      fueloPhone: settings.fueloPhone,
      fueloWhatsapp: settings.fueloWhatsapp,
      fueloEmail: settings.fueloEmail,
      fueloLogoUrl: toAbsolute(settings.fueloLogoUrl, origin),
      upiId: settings.upiId,
      qrCodeUrl: toAbsolute(settings.qrCodeUrl, origin),
      signatureUrl: toAbsolute(settings.signatureUrl, origin),
      signatoryLine1: settings.signatoryLine1,
      signatoryLine2: settings.signatoryLine2,
      footerNote: settings.footerNote,
    },
    customer: {
      companyName: invoice.customer.companyName,
      contactPerson: invoice.customer.contactPerson,
      billingAddress: invoice.customer.billingAddress,
      city: invoice.customer.city,
      state: invoice.customer.state,
      pincode: invoice.customer.pincode,
      country: invoice.customer.country,
      phone: invoice.customer.phone,
      email: invoice.customer.email ?? "",
      gstin: invoice.customer.gstin,
      placeOfSupply: invoice.customer.placeOfSupply,
    },
    lineItems: invoice.lineItems.map(
      (li) => ({
        categoryName: li.categoryName,
        packageName: li.packageName,
        quantity: li.quantity,
        rate: li.rate,
        gstPercent: li.gstPercent,
        total: li.total,
      })
    ),
    gstEnabled: invoice.gstEnabled,
    gstPercent: invoice.gstPercent,
    subtotal: invoice.subtotal,
    discountAmount: invoice.discountAmount,
    taxableAmount: invoice.taxableAmount,
    gstAmount: invoice.gstAmount,
    grandTotal: invoice.grandTotal,
    amountPaid: invoice.amountPaid,
    balanceDue: invoice.balanceDue,
    amountInWords: invoice.amountInWords,
    paymentMethod: invoice.paymentMethod,
    upiId: invoice.upiId,
    transactionRef: invoice.transactionRef,
    termsSections,
    generalTerms: generalTermsRow.content.split("\n").filter(Boolean),
  });

  const buffer = await renderToBuffer(doc as never);

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.invoiceNumber}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
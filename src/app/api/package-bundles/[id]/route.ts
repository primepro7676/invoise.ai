import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { packageBundleSchema } from "@/lib/validation";
import { ensurePackageBundleTable } from "@/lib/ensure-db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensurePackageBundleTable();
  const { id } = await params;

  try {
    const bundle = await prisma.packageBundle.findUnique({
      where: { id },
    });

    if (!bundle || !bundle.isActive) {
      return NextResponse.json({ error: "Package bundle not found" }, { status: 404 });
    }

    let items = [];
    try {
      items = JSON.parse(bundle.items);
    } catch {
      items = [];
    }

    return NextResponse.json({
      ...bundle,
      items,
    });
  } catch {
    return NextResponse.json({ error: "Package bundle not found" }, { status: 404 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  await ensurePackageBundleTable();

  const { id } = await params;
  const body = await req.json();

  const parsed = packageBundleSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
  if (data.tier !== undefined) updateData.tier = data.tier;
  if (data.items !== undefined) updateData.items = JSON.stringify(data.items);
  if (data.totalPrice !== undefined) updateData.totalPrice = data.totalPrice;
  if (data.discountPrice !== undefined) updateData.discountPrice = data.discountPrice;
  if (data.finalPrice !== undefined) updateData.finalPrice = data.finalPrice;
  if (data.platformsIncluded !== undefined) updateData.platformsIncluded = data.platformsIncluded;
  if (data.deliverables !== undefined) updateData.deliverables = data.deliverables;
  if (data.paymentTerms !== undefined) updateData.paymentTerms = data.paymentTerms;
  if (data.specialNote !== undefined) updateData.specialNote = data.specialNote;

  try {
    const updated = await prisma.packageBundle.update({
      where: { id },
      data: updateData,
    });

    let items = [];
    try {
      items = JSON.parse(updated.items);
    } catch {
      items = [];
    }

    return NextResponse.json({
      ...updated,
      items,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to update package bundle" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  await ensurePackageBundleTable();

  const { id } = await params;
  try {
    await prisma.packageBundle.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { packageBundleSchema } from "@/lib/validation";

export async function GET() {
  const bundles = await prisma.packageBundle.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const parsed = bundles.map((b) => {
    let items = [];
    try {
      items = JSON.parse(b.items);
    } catch {
      items = [];
    }
    return {
      ...b,
      items,
    };
  });

  return NextResponse.json(parsed);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const parsed = packageBundleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const count = await prisma.packageBundle.count();

  const bundle = await prisma.packageBundle.create({
    data: {
      name: data.name,
      subtitle: data.subtitle,
      tier: data.tier,
      items: JSON.stringify(data.items),
      totalPrice: data.totalPrice,
      discountPrice: data.discountPrice,
      finalPrice: data.finalPrice,
      platformsIncluded: data.platformsIncluded,
      deliverables: data.deliverables,
      paymentTerms: data.paymentTerms,
      specialNote: data.specialNote,
      sortOrder: count + 1,
      isActive: true,
    },
  });

  return NextResponse.json(
    {
      ...bundle,
      items: data.items,
    },
    { status: 201 }
  );
}


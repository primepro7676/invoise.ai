import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { categorySchema } from "@/lib/validation";

export async function GET() {
  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    include: { packages: { where: { isActive: true }, orderBy: { sortOrder: "asc" } }, terms: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const count = await prisma.serviceCategory.count();
  const category = await prisma.serviceCategory.create({
    data: { ...parsed.data, sortOrder: count + 1 },
  });
  await prisma.termsAndConditions.create({
    data: { categoryId: category.id, content: "1. Terms for this service.\n2. Edit this from the Terms & Conditions page." },
  });

  return NextResponse.json(category, { status: 201 });
}

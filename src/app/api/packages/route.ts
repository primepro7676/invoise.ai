import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { packageSchema } from "@/lib/validation";

export async function GET() {
  const packages = await prisma.package.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }],
  });
  return NextResponse.json(packages);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const parsed = packageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const count = await prisma.package.count({ where: { categoryId: parsed.data.categoryId } });
  const pkg = await prisma.package.create({ data: { ...parsed.data, sortOrder: count + 1 } });
  return NextResponse.json(pkg, { status: 201 });
}

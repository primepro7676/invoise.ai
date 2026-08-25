import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ categoryId: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { categoryId } = await params;

  const body = await req.json();
  if (typeof body.content !== "string") {
    return NextResponse.json({ error: "content must be a string" }, { status: 400 });
  }

  const terms = await prisma.termsAndConditions.upsert({
    where: { categoryId },
    update: { content: body.content },
    create: { categoryId, content: body.content },
  });
  return NextResponse.json(terms);
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { z } from "zod";

const assetSchema = z.object({
  primeproLogoUrl: z.string().optional(),
  fueloLogoUrl: z.string().optional(),
  qrCodeUrl: z.string().optional(),
  signatureUrl: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const parsed = assetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const settings = await prisma.companySettings.update({
    where: { id: "singleton" },
    data: parsed.data,
  });
  return NextResponse.json(settings);
}

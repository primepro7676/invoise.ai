import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if admin with this email exists
    const existing = await prisma.admin.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    return NextResponse.json(
      { ok: true, admin: { id: admin.id, name: admin.name, email: admin.email } },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create account." },
      { status: 500 }
    );
  }
}


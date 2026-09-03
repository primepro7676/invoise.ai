import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma, getDbConfig } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  return handleSync(req);
}

export async function POST(req: NextRequest) {
  return handleSync(req);
}

async function handleSync(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  // Basic security check: must provide ?secret=Admin@789 or matching NEXTAUTH_SECRET
  if (secret !== "Admin@789" && secret !== process.env.NEXTAUTH_SECRET && secret !== "syncAdmin") {
    return NextResponse.json(
      {
        status: "unauthorized",
        message: "Pass ?secret=Admin@789 in the URL to synchronize admin credentials.",
      },
      { status: 401 }
    );
  }

  const dbConfig = getDbConfig();
  const envDebug = {
    platform: process.platform,
    dbHost: dbConfig.host,
    dbPort: dbConfig.port,
    dbUser: dbConfig.user,
    dbName: dbConfig.database,
    hasSocketPath: Boolean(dbConfig.socketPath),
    hasPassword: Boolean(dbConfig.password),
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasNextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET),
    nextAuthUrl: process.env.NEXTAUTH_URL || "(not set)",
  };

  try {
    // 1. Verify database connection
    await prisma.$connect();

    // 2. Hash password
    const hashedPassword = await bcrypt.hash("Admin@789", 10);

    const accountsToSync = [
      { email: "admin@primepro.ai", name: "Admin" },
      { email: "laxmi.biradar@primepro.ai", name: "Laxmi Biradar" },
    ];

    const results = [];

    for (const acc of accountsToSync) {
      const existing = await prisma.admin.findUnique({
        where: { email: acc.email },
      });

      if (existing) {
        await prisma.admin.update({
          where: { id: existing.id },
          data: {
            password: hashedPassword,
            role: "ADMIN",
          },
        });
        results.push({ email: acc.email, status: "Password updated to Admin@789" });
      } else {
        await prisma.admin.create({
          data: {
            name: acc.name,
            email: acc.email,
            password: hashedPassword,
            role: "ADMIN",
          },
        });
        results.push({ email: acc.email, status: "Created account with password Admin@789" });
      }
    }

    const allAdmins = await prisma.admin.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    return NextResponse.json({
      status: "success",
      message: "Admin accounts successfully synchronized!",
      loginUrl: "/login",
      environment: envDebug,
      credentialsToUse: {
        email: "admin@primepro.ai",
        password: "Admin@789",
        alternateEmail: "laxmi.biradar@primepro.ai",
      },
      syncResults: results,
      totalAdminsInDatabase: allAdmins.length,
      admins: allAdmins,
    });
  } catch (error: any) {
    console.error("[SYNC ADMIN ERROR]", error);
    return NextResponse.json(
      {
        status: "database_error",
        error: error?.message || "Unknown database error",
        environment: envDebug,
        tip: "Please verify that your live database server is running, the database credentials in .env are correct, and migrations have been applied.",
      },
      { status: 500 }
    );
  }
}


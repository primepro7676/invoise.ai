import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const host = process.env.DATABASE_HOST === "localhost" ? "127.0.0.1" : (process.env.DATABASE_HOST || "127.0.0.1");

const adapter = new PrismaMariaDb({
  host,
  port: Number(process.env.DATABASE_PORT || 3306),
  user: process.env.DATABASE_USER!,
  password: process.env.DATABASE_PASSWORD!,
  database: process.env.DATABASE_NAME!,
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

async function test() {
  console.log("Connecting with host:", host);
  const customers = await prisma.customer.findMany({
    take: 5,
    include: { _count: { select: { invoices: true } } },
  });
  console.log("SUCCESS! Retrieved", customers.length, "customers from database.");
  for (const c of customers) {
    console.log(`- ${c.companyName} (${c._count.invoices} invoices)`);
  }
}

test()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });


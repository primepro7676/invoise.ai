import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

function getDbConfig() {
  let host = process.env.DATABASE_HOST || "127.0.0.1";
  let port = Number(process.env.DATABASE_PORT || 3306);
  let user = process.env.DATABASE_USER || "root";
  let password = process.env.DATABASE_PASSWORD || "";
  let database = process.env.DATABASE_NAME || "generateinvoic";

  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      host = url.hostname || host;
      port = url.port ? Number(url.port) : port;
      user = url.username ? decodeURIComponent(url.username) : user;
      password = url.password ? decodeURIComponent(url.password) : password;
      const pathname = url.pathname?.replace(/^\//, "");
      if (pathname) database = pathname;
    } catch {
      // fallback
    }
  }

  if (host === "localhost") {
    host = "127.0.0.1";
  }

  return { host, port, user, password, database };
}

const dbConfig = getDbConfig();

const adapter = new PrismaMariaDb({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  connectionLimit: 10,
  connectTimeout: 5000,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
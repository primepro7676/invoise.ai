import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

export function getDbConfig() {
  let host = process.env.DATABASE_HOST || "127.0.0.1";
  let port = Number(process.env.DATABASE_PORT || 3306);
  let user = process.env.DATABASE_USER || "root";
  let password = process.env.DATABASE_PASSWORD || "";
  let database = process.env.DATABASE_NAME || "generateinvoic";
  let socketPath = process.env.DATABASE_SOCKET || undefined;

  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      host = url.hostname || host;
      port = url.port ? Number(url.port) : port;
      user = url.username ? decodeURIComponent(url.username) : user;
      password = url.password ? decodeURIComponent(url.password) : password;
      const pathname = url.pathname?.replace(/^\//, "");
      if (pathname) database = pathname;
      const socket = url.searchParams.get("socket");
      if (socket) socketPath = socket;
    } catch {
      // fallback
    }
  }

  // Only rewrite localhost to 127.0.0.1 on Windows (where localhost resolves to IPv6 ::1)
  if (process.platform === "win32" && host === "localhost") {
    host = "127.0.0.1";
  }

  return { host, port, user, password, database, socketPath };
}

const dbConfig = getDbConfig();

const adapterConfig: Record<string, unknown> = {
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  connectionLimit: 10,
  connectTimeout: 8000,
};

if (dbConfig.socketPath) {
  adapterConfig.socketPath = dbConfig.socketPath;
} else {
  adapterConfig.host = dbConfig.host;
  adapterConfig.port = dbConfig.port;
}

const adapter = new PrismaMariaDb(adapterConfig as any);

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
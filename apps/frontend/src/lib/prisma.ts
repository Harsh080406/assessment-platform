import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
  isWarmedUp: boolean | undefined;
};

const connectionString = process.env.DATABASE_URL;

function createPrismaClient(): PrismaClient {
  // On Vercel serverless environment, use standard Prisma Client with rhel-openssl-3.0.x binary target
  if (process.env.VERCEL || !connectionString) {
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  try {
    const pool =
      globalForPrisma.pool ??
      new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        max: 10,
        connectionTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
      });

    if (process.env.NODE_ENV !== "production") globalForPrisma.pool = pool;

    const adapter = new PrismaPg(pool);

    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  } catch (err) {
    console.warn("[Prisma] Falling back to standard PrismaClient due to adapter init error:", err);
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Auto connection warm-up on server startup
if (connectionString && !globalForPrisma.isWarmedUp) {
  globalForPrisma.isWarmedUp = true;
  prisma
    .$queryRaw`SELECT 1`
    .then(() => {
      console.log("[Prisma] ⚡ Database connection pool warmed up successfully.");
    })
    .catch((err) => {
      console.warn("[Prisma] ⚠️ Database connection warm-up warning:", err?.message || err);
    });
}

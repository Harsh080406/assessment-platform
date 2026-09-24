import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
  isWarmedUp: boolean | undefined;
};

const connectionString = process.env.DATABASE_URL;

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

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Auto connection warm-up on server startup
if (!globalForPrisma.isWarmedUp) {
  globalForPrisma.isWarmedUp = true;
  prisma
    .$queryRaw`SELECT 1`
    .then(() => {
      console.log("[Prisma] ⚡ Database connection pool warmed up successfully via PrismaPg adapter.");
    })
    .catch((err) => {
      console.warn("[Prisma] ⚠️ Database connection warm-up warning:", err?.message || err);
    });
}

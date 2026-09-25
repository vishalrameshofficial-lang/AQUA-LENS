import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const rawUrl = process.env.DATABASE_URL || "";
export const isDatabaseAvailable = Boolean(
  rawUrl &&
  (rawUrl.startsWith("postgresql://") || rawUrl.startsWith("postgres://")) &&
  !rawUrl.includes("localhost:5432") &&
  !rawUrl.includes("aqua_user:aqua_pass")
);

// Fallback dummy URL to satisfy Prisma client schema validation when no cloud DB is configured
const databaseUrl = isDatabaseAvailable
  ? rawUrl
  : "postgresql://postgres:dummy_pass@db.dummy.invalid:5432/postgres";

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: isDatabaseAvailable ? ["error"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;



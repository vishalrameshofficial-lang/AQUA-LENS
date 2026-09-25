import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const rawUrl = process.env.DATABASE_URL || "";
const isValidPostgresUrl = rawUrl.startsWith("postgresql://") || rawUrl.startsWith("postgres://");

// Fallback dummy URL prevents Prisma from throwing validation fatal errors when no cloud DB is configured yet
const databaseUrl = isValidPostgresUrl
  ? rawUrl
  : "postgresql://aqua_user:aqua_pass@localhost:5432/aqualens_db?connect_timeout=3";

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;


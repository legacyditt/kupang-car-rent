import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function createPrismaClient(connectionString: string): PrismaClient {
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    globalForPrisma.prisma = createPrismaClient(connectionString);
  }
  return globalForPrisma.prisma;
}


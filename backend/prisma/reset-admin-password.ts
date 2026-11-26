import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "../src/generated/prisma/client.js";

/**
 * Emergency CLI script to reset the admin password if WhatsApp OTP is unavailable.
 * Usage: npm run admin:reset-password -- <email> <newPassword>
 */
async function main() {
  const [, , emailArg, newPassword] = process.argv;
  if (!emailArg || !newPassword || newPassword.length < 10) {
    console.error(
      "Usage: npm run admin:reset-password -- <email> <newPassword (min 10 chars)>"
    );
    process.exit(1);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const user = await prisma.user.findUnique({
      where: { email: emailArg.toLowerCase() },
    });
    if (!user) {
      console.error(`Admin user not found: ${emailArg}`);
      process.exit(1);
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.$transaction([
      prisma.account.updateMany({
        where: { userId: user.id, providerId: "credential" },
        data: { password: passwordHash },
      }),
      prisma.session.deleteMany({
        where: { userId: user.id },
      }),
    ]);

    console.log(
      `[admin:reset-password] Password updated and sessions revoked for ${user.email}`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main();


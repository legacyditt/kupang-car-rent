import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "../src/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run seed");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const SEED_CARS = [
  {
    id: "car-avanza",
    slug: "toyota-avanza",
    name: "Toyota Avanza",
    brand: "Toyota",
    category: "MPV",
    transmission: "BOTH",
    capacityLabel: "7 Kursi",
    pricePerDay: 300000,
    imageUrl: "/Toyota Avanza.jpg",
    status: "AVAILABLE" as const,
  },
  {
    id: "car-innova-reborn",
    slug: "toyota-innova-reborn",
    name: "Toyota Innova Reborn",
    brand: "Toyota",
    category: "MPV",
    transmission: "MATIC",
    capacityLabel: "7 Kursi",
    pricePerDay: 300000,
    imageUrl: "/Toyota Innova Reborn.png",
    status: "AVAILABLE" as const,
  },
  {
    id: "car-brio",
    slug: "honda-brio",
    name: "Honda Brio",
    brand: "Honda",
    category: "City Car",
    transmission: "MATIC",
    capacityLabel: "5 Kursi",
    pricePerDay: 300000,
    imageUrl: "/Honda Brio.jpeg",
    status: "AVAILABLE" as const,
  },
  {
    id: "car-hilux",
    slug: "toyota-hilux",
    name: "Toyota Hilux",
    brand: "Toyota",
    category: "Double Cabin",
    transmission: "MANUAL",
    capacityLabel: "5 Kursi",
    pricePerDay: 300000,
    imageUrl: "/Toyota Hilux.jpg",
    status: "AVAILABLE" as const,
  },
];

async function main() {
  // 1. Seed 4 unit awal (harga awal MVP Rp300.000/hari)
  for (const car of SEED_CARS) {
    await prisma.car.upsert({
      where: { slug: car.slug },
      update: {},
      create: car,
    });
  }

  // 2. Seed BusinessProfile default
  await prisma.businessProfile.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "Aventra Rental",
      tagline: "Driven in Gold Standard",
      description:
        "Sewa mobil harian di Kota Kupang. Avanza, Innova Reborn, Brio, dan Hilux — lepas kunci atau dengan sopir.",
      location: "Kota Kupang, Nusa Tenggara Timur",
      operatingHours: "24 Jam / Setiap Hari (Antar-Jemput Bandara El Tari)",
      whatsappNumber: "6281238989891",
      logoPath: "/logo-aventra.jpg",
    },
  });

  // 3. Seed Admin user (Better Auth credential account)
  const adminEmail = (
    process.env.SEED_ADMIN_EMAIL ?? "admin@aventrarental.id"
  ).toLowerCase();
  const adminUsername = (
    process.env.SEED_ADMIN_USERNAME ?? "admin"
  ).toLowerCase();
  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD ?? "aventra-admin-2026";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const userId = "admin-seed-user";
    const passwordHash = await hashPassword(adminPassword);

    await prisma.user.create({
      data: {
        id: userId,
        name: "Admin Aventra",
        email: adminEmail,
        emailVerified: true,
        username: adminUsername,
        displayUsername: adminUsername,
        role: "ADMIN",
        accounts: {
          create: {
            id: "admin-seed-account",
            accountId: userId,
            providerId: "credential",
            password: passwordHash,
          },
        },
      },
    });
  }

  console.log("[seed] Seeded 4 cars, default BusinessProfile, and admin user.");
}

main()
  .catch((err) => {
    console.error("[seed] Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


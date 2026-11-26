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
    transmission: "BOTH",
    capacityLabel: "7 Kursi",
    pricePerDay: 300000,
    imageUrl: "/Toyota Avanza.jpg",
    status: "AVAILABLE" as const,
    units: [
      {
        id: "unit-car-avanza",
        label: "Avanza #1",
        plateNumber: "DH 1102 AA",
        transmission: "MATIC" as const,
        status: "AVAILABLE" as const,
      },
      {
        id: "unit-car-avanza-2",
        label: "Avanza #2",
        plateNumber: "DH 1103 AA",
        transmission: "MANUAL" as const,
        status: "AVAILABLE" as const,
      },
    ],
  },
  {
    id: "car-innova-reborn",
    slug: "toyota-innova-reborn",
    name: "Toyota Innova Reborn",
    brand: "Toyota",
    transmission: "MATIC",
    capacityLabel: "7 Kursi",
    pricePerDay: 300000,
    imageUrl: "/Toyota Innova Reborn.png",
    status: "AVAILABLE" as const,
    units: [
      {
        id: "unit-car-innova-reborn",
        label: "Innova #1",
        plateNumber: "DH 1201 AB",
        transmission: "MATIC" as const,
        status: "AVAILABLE" as const,
      },
      {
        id: "unit-car-innova-reborn-2",
        label: "Innova #2",
        plateNumber: "DH 1202 AB",
        transmission: "MATIC" as const,
        status: "MAINTENANCE" as const,
      },
    ],
  },
  {
    id: "car-brio",
    slug: "honda-brio",
    name: "Honda Brio",
    brand: "Honda",
    transmission: "MATIC",
    capacityLabel: "5 Kursi",
    pricePerDay: 300000,
    imageUrl: "/Honda Brio.jpeg",
    status: "AVAILABLE" as const,
    units: [
      {
        id: "unit-car-brio",
        label: "Brio #1",
        plateNumber: "DH 1301 AC",
        transmission: "MATIC" as const,
        status: "AVAILABLE" as const,
      },
    ],
  },
  {
    id: "car-hilux",
    slug: "toyota-hilux",
    name: "Toyota Hilux",
    brand: "Toyota",
    transmission: "MANUAL",
    capacityLabel: "5 Kursi",
    pricePerDay: 300000,
    imageUrl: "/Toyota Hilux.jpg",
    status: "AVAILABLE" as const,
    units: [
      {
        id: "unit-car-hilux",
        label: "Hilux #1",
        plateNumber: "DH 1401 AD",
        transmission: "MANUAL" as const,
        status: "AVAILABLE" as const,
      },
    ],
  },
];

const SEED_BOOKINGS = [
  {
    bookingCode: "BK-20261120-A001",
    carId: "car-avanza",
    carUnitId: "unit-car-avanza",
    carNameSnapshot: "Toyota Avanza",
    carUnitLabelSnapshot: "Avanza #1 (DH 1102 AA)",
    customerName: "Yohanes Lopo",
    customerPhone: "6281234001101",
    startDate: new Date("2026-11-20"),
    endDate: new Date("2026-11-22"),
    totalDays: 3,
    serviceType: "SELF_DRIVE" as const,
    transmissionPreference: "MATIC" as const,
    pickupLocation: "Bandara El Tari Kupang",
    pricePerDaySnapshot: 300000,
    estimatedPrice: 900000,
    additionalFee: 0,
    finalPrice: 900000,
    paymentScheme: "FULL" as const,
    paymentStatus: "PAID" as const,
    paidAmount: 900000,
    status: "COMPLETED" as const,
    internalNote: "Serah terima di Bandara El Tari tepat waktu. KTP diverifikasi.",
  },
  {
    bookingCode: "BK-20261121-A002",
    carId: "car-innova-reborn",
    carUnitId: "unit-car-innova-reborn",
    carNameSnapshot: "Toyota Innova Reborn",
    carUnitLabelSnapshot: "Innova #1 (DH 1201 AB)",
    customerName: "Maria Neno",
    customerPhone: "6281234001102",
    startDate: new Date("2026-11-18"),
    endDate: new Date("2026-11-21"),
    totalDays: 4,
    serviceType: "WITH_DRIVER" as const,
    transmissionPreference: "MATIC" as const,
    pickupLocation: "Hotel Aston Kupang",
    pricePerDaySnapshot: 300000,
    estimatedPrice: 1200000,
    additionalFee: 0,
    finalPrice: 1200000,
    paymentScheme: "DP_50" as const,
    paymentStatus: "PAID" as const,
    paidAmount: 1200000,
    status: "COMPLETED" as const,
    internalNote: "Perjalanan dinas ke Soe, sopir Pak Anton.",
  },
  {
    bookingCode: "BK-20261122-A003",
    carId: "car-brio",
    carUnitId: "unit-car-brio",
    carNameSnapshot: "Honda Brio",
    carUnitLabelSnapshot: "Brio #1 (DH 1301 AC)",
    customerName: "Rizky Pratama",
    customerPhone: "6281234001103",
    startDate: new Date("2026-11-22"),
    endDate: new Date("2026-11-24"),
    totalDays: 3,
    serviceType: "SELF_DRIVE" as const,
    transmissionPreference: "MATIC" as const,
    pickupLocation: "Oebobo, Kota Kupang",
    pricePerDaySnapshot: 300000,
    estimatedPrice: 900000,
    additionalFee: 0,
    finalPrice: 900000,
    paymentScheme: "FULL" as const,
    paymentStatus: "PAID" as const,
    paidAmount: 900000,
    status: "COMPLETED" as const,
    internalNote: "Belum isi ulasan (/ulasan?kode=BK-20261122-A003).",
  },
  {
    bookingCode: "BK-20261125-A004",
    carId: "car-hilux",
    carUnitId: "unit-car-hilux",
    carNameSnapshot: "Toyota Hilux",
    carUnitLabelSnapshot: "Hilux #1 (DH 1401 AD)",
    customerName: "Hendra Wijaya",
    customerPhone: "6281234001104",
    startDate: new Date("2026-11-24"),
    endDate: new Date("2026-11-27"),
    totalDays: 4,
    serviceType: "WITH_DRIVER" as const,
    transmissionPreference: "MANUAL" as const,
    pickupLocation: "Kantor Gubernur NTT",
    pricePerDaySnapshot: 300000,
    estimatedPrice: 1200000,
    additionalFee: 0,
    finalPrice: 1200000,
    paymentScheme: "DP_50" as const,
    paymentStatus: "DP_PAID" as const,
    paidAmount: 600000,
    status: "IN_PROGRESS" as const,
    internalNote: "DP 50% masuk via transfer BCA. Sisa pelunasan saat kembali.",
  },
  {
    bookingCode: "BK-20261126-A005",
    carId: "car-avanza",
    carUnitId: "unit-car-avanza-2",
    carNameSnapshot: "Toyota Avanza",
    carUnitLabelSnapshot: "Avanza #2 (DH 1103 AA)",
    customerName: "Petrus Kase",
    customerPhone: "6281234001105",
    startDate: new Date("2026-11-26"),
    endDate: new Date("2026-11-28"),
    totalDays: 3,
    serviceType: "SELF_DRIVE" as const,
    transmissionPreference: "MANUAL" as const,
    pickupLocation: "Pelabuhan Tenau",
    pricePerDaySnapshot: 300000,
    estimatedPrice: 900000,
    additionalFee: 0,
    finalPrice: 900000,
    paymentScheme: "DP_50" as const,
    paymentStatus: "DP_PAID" as const,
    paidAmount: 450000,
    status: "CONFIRMED" as const,
    internalNote: "Unit Avanza #2 Manual disiapkan untuk tanggal 26 pagi.",
  },
  {
    bookingCode: "BK-20261127-A006",
    carId: "car-brio",
    carUnitId: "unit-car-brio",
    carNameSnapshot: "Honda Brio",
    carUnitLabelSnapshot: "Brio #1 (DH 1301 AC)",
    customerName: "Clara Sihombing",
    customerPhone: "6281234001106",
    startDate: new Date("2026-11-28"),
    endDate: new Date("2026-11-29"),
    totalDays: 2,
    serviceType: "SELF_DRIVE" as const,
    transmissionPreference: "MATIC" as const,
    pickupLocation: "Kayu Putih, Kupang",
    pricePerDaySnapshot: 300000,
    estimatedPrice: 600000,
    additionalFee: 0,
    finalPrice: 600000,
    paymentScheme: "FULL" as const,
    paymentStatus: "UNPAID" as const,
    paidAmount: 0,
    status: "CONFIRMED" as const,
    internalNote: "Bayar lunas saat serah terima kunci.",
  },
  {
    bookingCode: "BK-20261128-A007",
    carId: "car-avanza",
    carUnitId: null,
    carNameSnapshot: "Toyota Avanza",
    carUnitLabelSnapshot: null,
    customerName: "Dian Lestari",
    customerPhone: "6281234001107",
    startDate: new Date("2026-11-27"),
    endDate: new Date("2026-11-28"),
    totalDays: 2,
    serviceType: "SELF_DRIVE" as const,
    transmissionPreference: "MATIC" as const,
    pickupLocation: "Bandara El Tari Kupang",
    pricePerDaySnapshot: 300000,
    estimatedPrice: 600000,
    additionalFee: 0,
    finalPrice: 600000,
    paymentScheme: "FULL" as const,
    paymentStatus: "UNPAID" as const,
    paidAmount: 0,
    status: "PENDING" as const,
    internalNote: "Menunggu konfirmasi admin (Avanza #1 Matic masih kosong).",
  },
  {
    bookingCode: "BK-20261129-A008",
    carId: "car-innova-reborn",
    carUnitId: null,
    carNameSnapshot: "Toyota Innova Reborn",
    carUnitLabelSnapshot: null,
    customerName: "Bambang Setiawan",
    customerPhone: "6281234001108",
    startDate: new Date("2026-12-02"),
    endDate: new Date("2026-12-04"),
    totalDays: 3,
    serviceType: "WITH_DRIVER" as const,
    transmissionPreference: "MATIC" as const,
    pickupLocation: "Swiss-Belcourt Kupang",
    pricePerDaySnapshot: 300000,
    estimatedPrice: 900000,
    additionalFee: 0,
    finalPrice: 900000,
    paymentScheme: "DP_50" as const,
    paymentStatus: "UNPAID" as const,
    paidAmount: 0,
    status: "PENDING" as const,
    internalNote: "",
  },
  {
    bookingCode: "BK-20261115-A009",
    carId: "car-brio",
    carUnitId: null,
    carNameSnapshot: "Honda Brio",
    carUnitLabelSnapshot: null,
    customerName: "Fajar Nugroho",
    customerPhone: "6281234001109",
    startDate: new Date("2026-11-15"),
    endDate: new Date("2026-11-15"),
    totalDays: 1,
    serviceType: "SELF_DRIVE" as const,
    transmissionPreference: "MATIC" as const,
    pickupLocation: "Kota Lama Kupang",
    pricePerDaySnapshot: 300000,
    estimatedPrice: 300000,
    additionalFee: 0,
    finalPrice: 300000,
    paymentScheme: "FULL" as const,
    paymentStatus: "UNPAID" as const,
    paidAmount: 0,
    status: "CANCELLED" as const,
    internalNote: "Pelanggan batal berangkat karena perubahan jadwal pesawat.",
  },
];

async function main() {
  // 1. Seed 4 model mobil + unit fisik & plat nomor realistis Kupang
  for (const { units, ...carData } of SEED_CARS) {
    await prisma.car.upsert({
      where: { slug: carData.slug },
      update: {
        transmission: carData.transmission,
        capacityLabel: carData.capacityLabel,
      },
      create: carData,
    });

    for (const unit of units) {
      await prisma.carUnit.upsert({
        where: { id: unit.id },
        update: {
          label: unit.label,
          plateNumber: unit.plateNumber,
          transmission: unit.transmission,
          status: unit.status,
        },
        create: {
          ...unit,
          carId: carData.id,
        },
      });
    }
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
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.SEED_ADMIN_PASSWORD
  ) {
    throw new Error(
      "SEED_ADMIN_PASSWORD wajib diisi saat menjalankan seed di production."
    );
  }
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

  // 4. Seed realistic bookings
  const bookingByCode = new Map<string, string>();
  for (const b of SEED_BOOKINGS) {
    const row = await prisma.booking.upsert({
      where: { bookingCode: b.bookingCode },
      update: {},
      create: b,
    });
    bookingByCode.set(row.bookingCode, row.id);
  }

  // 5. Seed realistic testimonials (PUBLISHED & PENDING)
  const testimonials = [
    {
      id: "seed-tm-1",
      bookingId: bookingByCode.get("BK-20261120-A001"),
      bookingCode: "BK-20261120-A001",
      customerName: "Yohanes Lopo",
      carName: "Toyota Avanza",
      tripLabel: "Lepas Kunci",
      rating: 5,
      quote:
        "Unit Avanza sangat bersih, AC dingin, dan penyerahan di Bandara El Tari tepat waktu. Proses konfirmasi lewat WhatsApp juga cepat.",
      status: "PUBLISHED" as const,
    },
    {
      id: "seed-tm-2",
      bookingId: bookingByCode.get("BK-20261121-A002"),
      bookingCode: "BK-20261121-A002",
      customerName: "Maria Neno",
      carName: "Toyota Innova Reborn",
      tripLabel: "Dengan Sopir",
      rating: 5,
      quote:
        "Perjalanan dinas Kupang–Soe nyaman sekali. Sopir ramah, hafal rute, dan kondisi mobil terawat seperti baru.",
      status: "PUBLISHED" as const,
    },
    {
      id: "seed-tm-3",
      bookingId: null,
      bookingCode: null,
      customerName: "Andre Laksono",
      carName: "Toyota Hilux",
      tripLabel: "Dengan Sopir",
      rating: 5,
      quote:
        "Sewa Hilux untuk survei proyek ke daerah Timor Tengah. Tangguh di tanjakan dan jadwal sangat fleksibel.",
      status: "PUBLISHED" as const,
    },
    {
      id: "seed-tm-4",
      bookingId: null,
      bookingCode: null,
      customerName: "Sinta Dewi",
      carName: "Honda Brio",
      tripLabel: "Lepas Kunci",
      rating: 4,
      quote:
        "Mobil irit dan lincah buat keliling Kota Kupang. Harga jelas Rp300.000/hari tanpa biaya tersembunyi.",
      status: "PENDING" as const,
    },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.upsert({
      where: { id: t.id },
      update: {},
      create: t,
    });
  }

  console.log(
    `[seed] Seeded 4 car models (6 physical units), BusinessProfile, admin user, ${SEED_BOOKINGS.length} bookings, and ${testimonials.length} testimonials.`
  );
}

main()
  .catch((err) => {
    console.error("[seed] Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

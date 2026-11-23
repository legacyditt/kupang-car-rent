import type {
  BusinessProfile,
  PrismaClient,
} from "../../generated/prisma/client.js";

export const DEFAULT_PROFILE_SEED = {
  id: "default",
  name: "Aventra Rental",
  tagline: "Driven in Gold Standard",
  description:
    "Sewa mobil harian di Kota Kupang. Avanza, Innova Reborn, Brio, dan Hilux — lepas kunci atau dengan sopir.",
  location: "Kota Kupang, Nusa Tenggara Timur",
  operatingHours: "24 Jam / Setiap Hari (Antar-Jemput Bandara El Tari)",
  whatsappNumber: "6281238989891",
  logoPath: "/logo-aventra.jpg",
} as const;

export class BusinessProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findDefault(): Promise<BusinessProfile> {
    const existing = await this.prisma.businessProfile.findUnique({
      where: { id: "default" },
    });
    if (existing) return existing;

    return this.prisma.businessProfile.create({
      data: { ...DEFAULT_PROFILE_SEED },
    });
  }

  async upsertDefault(
    data: Partial<Omit<BusinessProfile, "id" | "updatedAt">>
  ): Promise<BusinessProfile> {
    return this.prisma.businessProfile.upsert({
      where: { id: "default" },
      update: data,
      create: {
        ...DEFAULT_PROFILE_SEED,
        ...data,
      },
    });
  }
}


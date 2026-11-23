import "dotenv/config";
import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import { createTestHarness } from "../helpers/testApp.js";

describe("Business Profile API", () => {
  const { prisma, app, loginAsAdmin } = createTestHarness();

  afterAll(async () => {
    // Restore default seeded profile
    await prisma.businessProfile.upsert({
      where: { id: "default" },
      update: {
        name: "Aventra Rental",
        tagline: "Driven in Gold Standard",
        description:
          "Sewa mobil harian di Kota Kupang. Avanza, Innova Reborn, Brio, dan Hilux — lepas kunci atau dengan sopir.",
        location: "Kota Kupang, Nusa Tenggara Timur",
        operatingHours: "24 Jam / Setiap Hari (Antar-Jemput Bandara El Tari)",
        whatsappNumber: "6281238989891",
        logoPath: "/logo-aventra.jpg",
      },
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
    await prisma.$disconnect();
  });

  it("GET /api/v1/business-profile returns public profile with formatted intl WA", async () => {
    const res = await request(app).get("/api/v1/business-profile");

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      name: "Aventra Rental",
      whatsappNumber: "6281238989891",
      whatsappDisplayIntl: "+62 812-3898-9891",
      logoPath: "/logo-aventra.jpg",
    });
  });

  it("PATCH /api/v1/admin/business-profile requires admin auth", async () => {
    const res = await request(app)
      .patch("/api/v1/admin/business-profile")
      .send({ name: "Unauthorized" });

    expect(res.status).toBe(401);
  });

  it("updates business profile and resets logo as admin", async () => {
    const cookies = await loginAsAdmin();

    const updateRes = await request(app)
      .patch("/api/v1/admin/business-profile")
      .set("Cookie", cookies)
      .send({
        name: "Aventra Kupang",
        whatsappNumber: "081238989899",
        location: "Jl. El Tari, Kupang",
        logoPath: "https://res.cloudinary.com/test/image/upload/logo.png",
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data).toMatchObject({
      name: "Aventra Kupang",
      whatsappNumber: "6281238989899",
      whatsappDisplayIntl: "+62 812-3898-9899",
      location: "Jl. El Tari, Kupang",
      logoPath: "https://res.cloudinary.com/test/image/upload/logo.png",
    });

    const resetRes = await request(app)
      .post("/api/v1/admin/business-profile/reset-logo")
      .set("Cookie", cookies);

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.data.logoPath).toBe("/logo-aventra.jpg");
  });
});


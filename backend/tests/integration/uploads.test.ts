import "dotenv/config";
import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import { createTestHarness } from "../helpers/testApp.js";

// Minimal valid 1x1 PNG header + bytes for magic-byte verification
const VALID_PNG_BUFFER = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
]);

describe("Uploads API", () => {
  const { prisma, app, loginAsAdmin } = createTestHarness();

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("rejects unauthenticated upload requests with 401", async () => {
    const res = await request(app)
      .post("/api/v1/admin/uploads/car-image")
      .attach("file", VALID_PNG_BUFFER, {
        filename: "car.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(401);
  });

  it("uploads valid PNG car image and logo as admin", async () => {
    const cookies = await loginAsAdmin();

    const carRes = await request(app)
      .post("/api/v1/admin/uploads/car-image")
      .set("Cookie", cookies)
      .attach("file", VALID_PNG_BUFFER, {
        filename: "avanza.png",
        contentType: "image/png",
      });

    expect(carRes.status).toBe(201);
    expect(carRes.body.data.url).toContain("https://res.cloudinary.com/");

    const logoRes = await request(app)
      .post("/api/v1/admin/uploads/logo")
      .set("Cookie", cookies)
      .attach("file", VALID_PNG_BUFFER, {
        filename: "logo.png",
        contentType: "image/png",
      });

    expect(logoRes.status).toBe(201);
    expect(logoRes.body.data.url).toContain("https://res.cloudinary.com/");
  });

  it("rejects spoofed non-image file content with 400", async () => {
    const cookies = await loginAsAdmin();

    const res = await request(app)
      .post("/api/v1/admin/uploads/car-image")
      .set("Cookie", cookies)
      .attach("file", Buffer.from("not-an-image-script"), {
        filename: "fake.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_FILE");
  });

  it("rejects logo larger than 1 MB with 400", async () => {
    const cookies = await loginAsAdmin();
    const oversized = Buffer.concat([
      VALID_PNG_BUFFER,
      Buffer.alloc(1_048_577 - VALID_PNG_BUFFER.length),
    ]);

    const res = await request(app)
      .post("/api/v1/admin/uploads/logo")
      .set("Cookie", cookies)
      .attach("file", oversized, {
        filename: "big-logo.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("FILE_TOO_LARGE");
  });
});


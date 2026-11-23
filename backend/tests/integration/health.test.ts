import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";

describe("GET /api/v1/health", () => {
  it("returns 200 OK with service status payload", async () => {
    const app = createApp({
      corsOrigin: "http://localhost:5173",
      nodeEnv: "test",
    });

    const res = await request(app).get("/api/v1/health");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      data: {
        status: "ok",
        service: "kupang-car-rent-backend",
      },
    });
    expect(typeof res.body.data.timestamp).toBe("string");
  });

  it("returns 404 JSON error envelope for unknown route", async () => {
    const app = createApp({
      corsOrigin: "http://localhost:5173",
      nodeEnv: "test",
    });

    const res = await request(app).get("/api/v1/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Endpoint tidak ditemukan.",
      },
    });
  });
});


import { Router } from "express";

export const v1Router = Router();

v1Router.get("/health", (_req, res) => {
  res.status(200).json({
    data: {
      status: "ok",
      service: "kupang-car-rent-backend",
      timestamp: new Date().toISOString(),
    },
  });
});


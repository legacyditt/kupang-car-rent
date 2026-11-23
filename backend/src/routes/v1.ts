import { Router } from "express";
import type { AuthInstance } from "../lib/auth.js";
import { createRequireAdmin } from "../middlewares/requireAdmin.js";

export function createV1Router(auth?: AuthInstance): Router {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.status(200).json({
      data: {
        status: "ok",
        service: "kupang-car-rent-backend",
        timestamp: new Date().toISOString(),
      },
    });
  });

  if (auth) {
    const requireAdmin = createRequireAdmin(auth);

    router.get("/admin/me", requireAdmin, (req, res) => {
      res.status(200).json({
        data: req.adminUser,
      });
    });
  }

  return router;
}

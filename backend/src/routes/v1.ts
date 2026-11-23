import { Router } from "express";
import type { PrismaClient } from "../generated/prisma/client.js";
import type { AuthInstance } from "../lib/auth.js";
import type { ImageStorage } from "../lib/imageStorage.js";
import { createRequireAdmin } from "../middlewares/requireAdmin.js";
import { validateBody, validateQuery } from "../middlewares/validate.js";
import { CarController } from "../modules/cars/car.controller.js";
import { CarRepository } from "../modules/cars/car.repository.js";
import {
  availabilityQuerySchema,
  createCarSchema,
  updateCarSchema,
  updateCarStatusSchema,
} from "../modules/cars/car.schema.js";
import { CarService } from "../modules/cars/car.service.js";
import { BusinessProfileController } from "../modules/settings/businessProfile.controller.js";
import { BusinessProfileRepository } from "../modules/settings/businessProfile.repository.js";
import { updateBusinessProfileSchema } from "../modules/settings/businessProfile.schema.js";
import { BusinessProfileService } from "../modules/settings/businessProfile.service.js";
import {
  carImageUploadMiddleware,
  logoUploadMiddleware,
  UploadController,
} from "../modules/uploads/upload.controller.js";
import { UploadService } from "../modules/uploads/upload.service.js";

export interface V1RouterDeps {
  auth?: AuthInstance;
  prisma?: PrismaClient;
  imageStorage?: ImageStorage;
}

export function createV1Router(deps: V1RouterDeps = {}): Router {
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

  if (deps.prisma) {
    const profileController = new BusinessProfileController(
      new BusinessProfileService(new BusinessProfileRepository(deps.prisma))
    );
    const carController = new CarController(
      new CarService(new CarRepository(deps.prisma))
    );

    // Public domain routes
    router.get("/business-profile", profileController.getPublicProfile);
    router.get("/cars", carController.listPublicCars);
    router.get(
      "/cars/:slug/availability",
      validateQuery(availabilityQuerySchema),
      carController.checkAvailability
    );

    if (deps.auth) {
      const requireAdmin = createRequireAdmin(deps.auth);

      router.get("/admin/me", requireAdmin, (req, res) => {
        res.status(200).json({ data: req.adminUser });
      });

      // Admin Business Profile
      router.patch(
        "/admin/business-profile",
        requireAdmin,
        validateBody(updateBusinessProfileSchema),
        profileController.updateProfile
      );
      router.post(
        "/admin/business-profile/reset-logo",
        requireAdmin,
        profileController.resetLogo
      );

      // Admin Cars CRUD
      router.get("/admin/cars", requireAdmin, carController.listAdminCars);
      router.post(
        "/admin/cars",
        requireAdmin,
        validateBody(createCarSchema),
        carController.createCar
      );
      router.patch(
        "/admin/cars/:id",
        requireAdmin,
        validateBody(updateCarSchema),
        carController.updateCar
      );
      router.patch(
        "/admin/cars/:id/status",
        requireAdmin,
        validateBody(updateCarStatusSchema),
        carController.updateCarStatus
      );
      router.delete("/admin/cars/:id", requireAdmin, carController.deleteCar);

      // Admin Uploads
      if (deps.imageStorage) {
        const uploadController = new UploadController(
          new UploadService(deps.imageStorage)
        );
        router.post(
          "/admin/uploads/car-image",
          requireAdmin,
          carImageUploadMiddleware,
          uploadController.uploadCarImage
        );
        router.post(
          "/admin/uploads/logo",
          requireAdmin,
          logoUploadMiddleware,
          uploadController.uploadLogo
        );
      }
    }
  } else if (deps.auth) {
    const requireAdmin = createRequireAdmin(deps.auth);
    router.get("/admin/me", requireAdmin, (req, res) => {
      res.status(200).json({ data: req.adminUser });
    });
  }

  return router;
}

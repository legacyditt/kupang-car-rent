import { Router } from "express";
import type { PrismaClient } from "../generated/prisma/client.js";
import type { AuthInstance } from "../lib/auth.js";
import type { ImageStorage } from "../lib/imageStorage.js";
import {
  bookingRateLimiter,
  testimonialRateLimiter,
} from "../middlewares/rateLimit.js";
import { createRequireAdmin } from "../middlewares/requireAdmin.js";
import { validateBody, validateQuery } from "../middlewares/validate.js";
import { BookingController } from "../modules/bookings/booking.controller.js";
import { BookingRepository } from "../modules/bookings/booking.repository.js";
import {
  adminCreateBookingSchema,
  createPublicBookingSchema,
  extendBookingSchema,
  listBookingsQuerySchema,
  updateBookingDetailsSchema,
  updateBookingPaymentSchema,
  updateBookingStatusSchema,
} from "../modules/bookings/booking.schema.js";
import { BookingService } from "../modules/bookings/booking.service.js";
import { CalendarController } from "../modules/calendar/calendar.controller.js";
import { calendarQuerySchema } from "../modules/calendar/calendar.schema.js";
import { CalendarService } from "../modules/calendar/calendar.service.js";
import { CarController } from "../modules/cars/car.controller.js";
import { CarRepository } from "../modules/cars/car.repository.js";
import {
  availabilityQuerySchema,
  createCarSchema,
  createCarUnitSchema,
  updateCarSchema,
  updateCarStatusSchema,
  updateCarUnitSchema,
} from "../modules/cars/car.schema.js";
import { CarService } from "../modules/cars/car.service.js";
import { DashboardController } from "../modules/dashboard/dashboard.controller.js";
import { DashboardService } from "../modules/dashboard/dashboard.service.js";
import { FinanceController } from "../modules/finance/finance.controller.js";
import { financeQuerySchema } from "../modules/finance/finance.schema.js";
import { FinanceService } from "../modules/finance/finance.service.js";
import { BusinessProfileController } from "../modules/settings/businessProfile.controller.js";
import { BusinessProfileRepository } from "../modules/settings/businessProfile.repository.js";
import { updateBusinessProfileSchema } from "../modules/settings/businessProfile.schema.js";
import { BusinessProfileService } from "../modules/settings/businessProfile.service.js";
import { TestimonialController } from "../modules/testimonials/testimonial.controller.js";
import { TestimonialRepository } from "../modules/testimonials/testimonial.repository.js";
import {
  adminUpsertTestimonialSchema,
  eligibilityQuerySchema,
  submitPublicTestimonialSchema,
  updateTestimonialStatusSchema,
} from "../modules/testimonials/testimonial.schema.js";
import { TestimonialService } from "../modules/testimonials/testimonial.service.js";
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
    const bookingController = new BookingController(
      new BookingService(new BookingRepository(deps.prisma))
    );
    const calendarController = new CalendarController(
      new CalendarService(deps.prisma)
    );
    const financeController = new FinanceController(
      new FinanceService(deps.prisma)
    );
    const dashboardController = new DashboardController(
      new DashboardService(deps.prisma)
    );
    const testimonialController = new TestimonialController(
      new TestimonialService(new TestimonialRepository(deps.prisma))
    );

    // Public domain routes
    router.get("/business-profile", profileController.getPublicProfile);
    router.get("/cars", carController.listPublicCars);
    router.get(
      "/cars/:slug/availability",
      validateQuery(availabilityQuerySchema),
      carController.checkAvailability
    );
    router.post(
      "/bookings",
      bookingRateLimiter,
      validateBody(createPublicBookingSchema),
      bookingController.createPublicBooking
    );
    router.get(
      "/bookings/code/:bookingCode",
      bookingController.getPublicByCode
    );
    router.get("/testimonials", testimonialController.listPublic);
    router.get(
      "/testimonials/eligibility",
      validateQuery(eligibilityQuerySchema),
      testimonialController.checkEligibility
    );
    router.post(
      "/testimonials",
      testimonialRateLimiter,
      validateBody(submitPublicTestimonialSchema),
      testimonialController.submitPublic
    );

    if (deps.auth) {
      const requireAdmin = createRequireAdmin(deps.auth);

      router.get("/admin/me", requireAdmin, (req, res) => {
        res.status(200).json({ data: req.adminUser });
      });

      // Admin Dashboard, Calendar & Finance
      router.get(
        "/admin/dashboard/summary",
        requireAdmin,
        dashboardController.getSummary
      );
      router.get(
        "/admin/calendar",
        requireAdmin,
        validateQuery(calendarQuerySchema),
        calendarController.getCalendar
      );
      router.get(
        "/admin/finance/summary",
        requireAdmin,
        validateQuery(financeQuerySchema),
        financeController.getSummary
      );

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
      router.post(
        "/admin/cars/:id/units",
        requireAdmin,
        validateBody(createCarUnitSchema),
        carController.addCarUnit
      );
      router.patch(
        "/admin/car-units/:unitId",
        requireAdmin,
        validateBody(updateCarUnitSchema),
        carController.updateCarUnit
      );
      router.delete(
        "/admin/car-units/:unitId",
        requireAdmin,
        carController.deleteCarUnit
      );

      // Admin Bookings
      router.get(
        "/admin/bookings",
        requireAdmin,
        validateQuery(listBookingsQuerySchema),
        bookingController.listAdminBookings
      );
      router.get(
        "/admin/bookings/:id",
        requireAdmin,
        bookingController.getAdminBooking
      );
      router.post(
        "/admin/bookings",
        requireAdmin,
        validateBody(adminCreateBookingSchema),
        bookingController.createAdminBooking
      );
      router.patch(
        "/admin/bookings/:id",
        requireAdmin,
        validateBody(updateBookingDetailsSchema),
        bookingController.updateBookingDetails
      );
      router.patch(
        "/admin/bookings/:id/status",
        requireAdmin,
        validateBody(updateBookingStatusSchema),
        bookingController.transitionStatus
      );
      router.patch(
        "/admin/bookings/:id/payment",
        requireAdmin,
        validateBody(updateBookingPaymentSchema),
        bookingController.updatePayment
      );
      router.post(
        "/admin/bookings/:id/extend",
        requireAdmin,
        validateBody(extendBookingSchema),
        bookingController.extendBooking
      );

      // Admin Testimonials
      router.get(
        "/admin/testimonials",
        requireAdmin,
        testimonialController.listAdmin
      );
      router.post(
        "/admin/testimonials",
        requireAdmin,
        validateBody(adminUpsertTestimonialSchema),
        testimonialController.createAdmin
      );
      router.patch(
        "/admin/testimonials/:id",
        requireAdmin,
        validateBody(adminUpsertTestimonialSchema.partial()),
        testimonialController.updateAdmin
      );
      router.patch(
        "/admin/testimonials/:id/status",
        requireAdmin,
        validateBody(updateTestimonialStatusSchema),
        testimonialController.updateStatus
      );
      router.delete(
        "/admin/testimonials/:id",
        requireAdmin,
        testimonialController.deleteAdmin
      );

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

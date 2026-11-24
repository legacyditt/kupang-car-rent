import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../utils/AppError.js";

/** Catch-all 404 handler for unmatched routes. */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Endpoint tidak ditemukan.",
    },
  });
}

/** Express 5 centralized error-handling middleware (4-argument signature). */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Data yang dikirim tidak valid.",
        details: err.issues,
      },
    });
    return;
  }

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        error: {
          code: "FILE_TOO_LARGE",
          message: "Ukuran file melebihi batas maksimum yang diizinkan.",
        },
      });
      return;
    }
    res.status(400).json({
      error: {
        code: "INVALID_FILE",
        message: err.message,
      },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({
        error: {
          code: "DUPLICATE_RESOURCE",
          message: "Data sudah ada dan tidak boleh duplikat.",
        },
      });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Data yang diminta tidak ditemukan.",
        },
      });
      return;
    }
  }

  const message =
    err instanceof Error ? err.message : "Terjadi kesalahan pada server.";

  // PostgreSQL 23P01 exclusion_violation (BR-09 double booking protection)
  if (message.includes("23P01") || message.includes("booking_no_overlap_confirmed_or_active")) {
    res.status(409).json({
      error: {
        code: "SCHEDULE_CONFLICT",
        message: "Jadwal unit bentrok dengan booking lain yang sudah dikonfirmasi.",
      },
    });
    return;
  }

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message:
        process.env.NODE_ENV === "production"
          ? "Terjadi kesalahan pada server."
          : message,
    },
  });
}

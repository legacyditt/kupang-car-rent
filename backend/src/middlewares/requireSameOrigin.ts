import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";

const MUTATING_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

/** Enforces same-origin checks on mutating admin requests to mitigate CSRF. */
export function createRequireSameOrigin(allowedOrigin: string) {
  let expectedOrigin = allowedOrigin;
  try {
    expectedOrigin = new URL(allowedOrigin).origin;
  } catch {
    // Keep raw string if allowedOrigin is non-URL in tests.
  }

  return function requireSameOrigin(
    req: Request,
    _res: Response,
    next: NextFunction
  ): void {
    if (!MUTATING_METHODS.has(req.method.toUpperCase())) {
      next();
      return;
    }

    const secFetchSite = req.header("sec-fetch-site")?.toLowerCase();
    if (secFetchSite === "cross-site") {
      next(
        new AppError(
          403,
          "CSRF_FORBIDDEN",
          "Permintaan lintas-situs ditolak."
        )
      );
      return;
    }

    const origin = req.header("origin");
    if (origin) {
      let requestOrigin = origin;
      try {
        requestOrigin = new URL(origin).origin;
      } catch {
        requestOrigin = "";
      }
      if (requestOrigin !== expectedOrigin) {
        next(
          new AppError(
            403,
            "CSRF_FORBIDDEN",
            "Origin permintaan tidak diizinkan."
          )
        );
        return;
      }
    } else {
      const referer = req.header("referer");
      if (referer) {
        let refererOrigin = "";
        try {
          refererOrigin = new URL(referer).origin;
        } catch {
          refererOrigin = "";
        }
        if (refererOrigin !== expectedOrigin) {
          next(
            new AppError(
              403,
              "CSRF_FORBIDDEN",
              "Referer permintaan tidak diizinkan."
            )
          );
          return;
        }
      }
    }

    next();
  };
}


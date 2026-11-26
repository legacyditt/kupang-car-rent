import { rateLimit } from "express-rate-limit";

function createJsonRateLimiter(maxRequests: number, windowMinutes: number) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit: maxRequests,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === "test",
    handler: (_req, res) => {
      res.status(429).json({
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Terlalu banyak permintaan. Silakan coba lagi beberapa menit lagi.",
        },
      });
    },
  });
}

export const bookingRateLimiter = createJsonRateLimiter(10, 15);
export const testimonialRateLimiter = createJsonRateLimiter(5, 15);
export const publicLookupRateLimiter = createJsonRateLimiter(20, 15);
export const authRateLimiter = createJsonRateLimiter(30, 15);


import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pinoHttp, type HttpLogger } from "pino-http";
import type { DestinationStream } from "pino";
import type { PrismaClient } from "./generated/prisma/client.js";
import type { AuthInstance } from "./lib/auth.js";
import type { ImageStorage } from "./lib/imageStorage.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { authRateLimiter } from "./middlewares/rateLimit.js";
import { createRequireSameOrigin } from "./middlewares/requireSameOrigin.js";
import { createV1Router } from "./routes/v1.js";

export interface CreateAppOptions {
  corsOrigin: string;
  nodeEnv: "development" | "test" | "production";
  auth?: AuthInstance;
  prisma?: PrismaClient;
  imageStorage?: ImageStorage;
  logStream?: DestinationStream;
}

/** Creates the HTTP request logger with sensitive auth headers redacted. */
export function createHttpLogger(stream?: DestinationStream): HttpLogger {
  const opts = {
    redact: {
      paths: [
        "req.headers.cookie",
        "req.headers.authorization",
        'res.headers["set-cookie"]',
      ],
      censor: "[REDACTED]",
    },
  };
  return stream ? pinoHttp(opts, stream) : pinoHttp(opts);
}

/** Builds and configures the Express 5 application instance. */
export function createApp(options: CreateAppOptions): Express {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(
    cors({
      origin: options.corsOrigin,
      credentials: true,
    })
  );

  if (options.nodeEnv !== "test") {
    app.use(createHttpLogger(options.logStream));
  }

  // Better Auth handler MUST be mounted before express.json() (Express 5 *splat syntax).
  if (options.auth) {
    app.use("/api/auth", authRateLimiter);
    app.all("/api/auth/*splat", toNodeHandler(options.auth));
  }

  app.use(express.json({ limit: "1mb" }));

  app.use("/api/v1/admin", createRequireSameOrigin(options.corsOrigin));

  app.use(
    "/api/v1",
    createV1Router({
      auth: options.auth,
      prisma: options.prisma,
      imageStorage: options.imageStorage,
    })
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

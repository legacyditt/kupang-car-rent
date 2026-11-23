import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import type { AuthInstance } from "./lib/auth.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { createV1Router } from "./routes/v1.js";

export interface CreateAppOptions {
  corsOrigin: string;
  nodeEnv: "development" | "test" | "production";
  auth?: AuthInstance;
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
    app.use(pinoHttp());
  }

  // Better Auth handler MUST be mounted before express.json() (Express 5 *splat syntax).
  if (options.auth) {
    app.all("/api/auth/*splat", toNodeHandler(options.auth));
  }

  app.use(express.json({ limit: "1mb" }));

  app.use("/api/v1", createV1Router(options.auth));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

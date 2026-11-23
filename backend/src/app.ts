import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { v1Router } from "./routes/v1.js";

export interface CreateAppOptions {
  corsOrigin: string;
  nodeEnv: "development" | "test" | "production";
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

  app.use(express.json({ limit: "1mb" }));

  app.use("/api/v1", v1Router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}


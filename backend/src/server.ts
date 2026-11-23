import "dotenv/config";
import { createApp } from "./app.js";
import { getEnv } from "./config/env.js";

const env = getEnv();
const app = createApp({
  corsOrigin: env.CORS_ORIGIN,
  nodeEnv: env.NODE_ENV,
});

const server = app.listen(env.PORT, () => {
  console.log(
    `[server] kupang-car-rent-backend listening on http://localhost:${env.PORT} (${env.NODE_ENV})`
  );
});

function shutdown(signal: string): void {
  console.log(`[server] ${signal} received, shutting down gracefully...`);
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));


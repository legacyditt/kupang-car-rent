import "dotenv/config";
import { bootstrapApp } from "./bootstrap.js";

const { app, env, prisma } = bootstrapApp();

const server = app.listen(env.PORT, () => {
  console.log(
    `[server] kupang-car-rent-backend listening on http://localhost:${env.PORT} (${env.NODE_ENV})`
  );
});

// Prevent slow/stalled clients from holding sockets open indefinitely in production.
server.requestTimeout = 30_000;

function shutdown(signal: string): void {
  console.log(`[server] ${signal} received, shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

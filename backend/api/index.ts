import { bootstrapApp } from "../src/bootstrap.js";

/**
 * Vercel Serverless Function entry point.
 * Cached at module scope so warm invocations reuse the Express app and Prisma client.
 */
const { app } = bootstrapApp();

export default app;

